import type {
  LocalRuntimeConfig,
  RuntimeExecutionContext,
  RuntimeJob,
  RuntimeJobRecord,
  RuntimeQueue
} from "./types";

interface StoredRuntimeJob extends RuntimeJobRecord {
  run: (context: RuntimeExecutionContext) => Promise<unknown>;
}

const defaultConfig: LocalRuntimeConfig = {
  modelLoadPolicy: "load-per-job",
  maxConcurrentHeavyJobs: 1
};

export class SequentialJobRunner implements RuntimeQueue {
  private readonly config: LocalRuntimeConfig;
  private readonly jobs = new Map<string, StoredRuntimeJob>();
  private readonly queue: string[] = [];
  private readonly controllers = new Map<string, AbortController>();
  private runningJobId: string | null = null;
  private activeHeavyJobs = 0;

  constructor(config: Partial<LocalRuntimeConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
      maxConcurrentHeavyJobs: 1
    };
  }

  enqueue(job: RuntimeJob): RuntimeJobRecord {
    if (this.jobs.has(job.id)) {
      throw new Error(`Runtime job already exists: ${job.id}`);
    }

    const record: StoredRuntimeJob = {
      id: job.id,
      name: job.name,
      heavy: job.heavy,
      priority: job.priority ?? 0,
      model: job.model ?? null,
      status: "pending",
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      output: null,
      error: null,
      metadata: job.metadata ?? {},
      events: [],
      run: job.run
    };

    addEvent(record, "queued", "Runtime job queued.");
    this.jobs.set(record.id, record);
    this.queue.push(record.id);
    this.sortQueue();

    return toPublicRecord(record);
  }

  cancel(jobId: string): boolean {
    const job = this.jobs.get(jobId);

    if (!job) {
      return false;
    }

    if (job.status === "pending") {
      job.status = "cancelled";
      job.completedAt = new Date().toISOString();
      addEvent(job, "cancelled", "Runtime job cancelled before start.");
      removeQueuedJob(this.queue, jobId);
      return true;
    }

    if (job.status === "running") {
      job.status = "cancelled";
      job.completedAt = new Date().toISOString();
      addEvent(job, "cancelled", "Runtime job cancellation requested.");
      this.controllers.get(jobId)?.abort();
      return true;
    }

    return false;
  }

  getActiveJob(): RuntimeJobRecord | undefined {
    if (this.runningJobId === null) {
      return undefined;
    }

    return this.getJob(this.runningJobId);
  }

  getJob(jobId: string): RuntimeJobRecord | undefined {
    const job = this.jobs.get(jobId);

    return job ? toPublicRecord(job) : undefined;
  }

  listJobs(): RuntimeJobRecord[] {
    return Array.from(this.jobs.values()).map((job) => toPublicRecord(job));
  }

  async runNext(): Promise<RuntimeJobRecord | undefined> {
    if (this.runningJobId !== null) {
      return undefined;
    }

    const job = this.shiftNextPendingJob();

    if (!job) {
      return undefined;
    }

    if (job.heavy && this.activeHeavyJobs >= this.config.maxConcurrentHeavyJobs) {
      return undefined;
    }

    const controller = new AbortController();
    this.controllers.set(job.id, controller);
    this.runningJobId = job.id;
    job.status = "running";
    job.startedAt = new Date().toISOString();
    addEvent(job, "started", "Runtime job started.");

    if (job.heavy) {
      this.activeHeavyJobs += 1;
    }

    try {
      await this.config.hooks?.beforeJobStart?.(toPublicRecord(job));

      if (job.model) {
        addEvent(job, "model-load", "Runtime model load hook started.");
        await this.config.hooks?.beforeModelLoad?.(job.model, toPublicRecord(job));
      }

      const output = await job.run(createExecutionContext(job, controller));

      if (controller.signal.aborted) {
        markCancelled(job);
      } else {
        job.status = "completed";
        job.output = output;
        job.completedAt = new Date().toISOString();
        addEvent(job, "completed", "Runtime job completed.");
        await this.config.hooks?.afterJobComplete?.(toPublicRecord(job));
      }
    } catch (error) {
      if (controller.signal.aborted) {
        markCancelled(job);
      } else {
        job.status = "failed";
        job.error = toErrorMessage(error);
        job.completedAt = new Date().toISOString();
        addEvent(job, "failed", job.error);
        await this.config.hooks?.onJobFail?.(toPublicRecord(job));
      }
    } finally {
      if (job.model) {
        await this.config.hooks?.afterModelUnload?.(job.model, toPublicRecord(job));
        addEvent(job, "model-unload", "Runtime model unload hook completed.");
      }

      if (job.heavy) {
        this.activeHeavyJobs -= 1;
      }

      this.controllers.delete(job.id);
      this.runningJobId = null;
    }

    return toPublicRecord(job);
  }

  async runAll(): Promise<RuntimeJobRecord[]> {
    const completed: RuntimeJobRecord[] = [];

    while (this.hasPendingJobs()) {
      const result = await this.runNext();

      if (!result) {
        break;
      }

      completed.push(result);
    }

    return completed;
  }

  private shiftNextPendingJob(): StoredRuntimeJob | undefined {
    while (this.queue.length > 0) {
      const jobId = this.queue.shift();

      if (!jobId) {
        continue;
      }

      const job = this.jobs.get(jobId);

      if (job?.status === "pending") {
        return job;
      }
    }

    return undefined;
  }

  private hasPendingJobs(): boolean {
    return Array.from(this.jobs.values()).some((job) => job.status === "pending");
  }

  private sortQueue(): void {
    this.queue.sort((leftId, rightId) => {
      const left = this.jobs.get(leftId);
      const right = this.jobs.get(rightId);

      return (right?.priority ?? 0) - (left?.priority ?? 0);
    });
  }
}

function createExecutionContext(
  job: StoredRuntimeJob,
  controller: AbortController
): RuntimeExecutionContext {
  return {
    jobId: job.id,
    signal: controller.signal,
    model: job.model,
    metadata: job.metadata
  };
}

function toPublicRecord(job: StoredRuntimeJob): RuntimeJobRecord {
  return {
    id: job.id,
    name: job.name,
    heavy: job.heavy,
    priority: job.priority,
    model: job.model,
    status: job.status,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    output: job.output,
    error: job.error,
    metadata: { ...job.metadata },
    events: job.events.map((event) => ({
      ...event,
      metadata: { ...event.metadata }
    }))
  };
}

function markCancelled(job: StoredRuntimeJob): void {
  job.status = "cancelled";
  job.completedAt = new Date().toISOString();
  addEvent(job, "cancelled", "Runtime job cancelled.");
}

function removeQueuedJob(queue: string[], jobId: string): void {
  const index = queue.indexOf(jobId);

  if (index >= 0) {
    queue.splice(index, 1);
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Runtime job failed.";
}

function addEvent(
  job: StoredRuntimeJob,
  type: RuntimeJobRecord["events"][number]["type"],
  message: string,
  metadata: Record<string, unknown> = {}
): void {
  job.events.push({
    type,
    message,
    createdAt: new Date().toISOString(),
    metadata
  });
}
