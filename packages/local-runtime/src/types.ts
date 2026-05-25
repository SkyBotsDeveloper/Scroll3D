export type RuntimeJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type ModelLoadPolicy = "load-per-job" | "keep-loaded" | "unload-after-job";

export interface RuntimeModelRef {
  id: string;
  name: string;
  providerType: "llm" | "image" | "video" | "frame" | "code";
  heavy: boolean;
  path: string | null;
  metadata: Record<string, unknown>;
}

export interface RuntimeExecutionContext {
  jobId: string;
  signal: AbortSignal;
  model: RuntimeModelRef | null;
  metadata: Record<string, unknown>;
}

export interface RuntimeJob<TOutput = unknown> {
  id: string;
  name: string;
  heavy: boolean;
  model?: RuntimeModelRef;
  metadata?: Record<string, unknown>;
  run: (context: RuntimeExecutionContext) => Promise<TOutput>;
}

export interface RuntimeJobRecord<TOutput = unknown> {
  id: string;
  name: string;
  heavy: boolean;
  model: RuntimeModelRef | null;
  status: RuntimeJobStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  output: TOutput | null;
  error: string | null;
  metadata: Record<string, unknown>;
}

export interface RuntimeModelHooks {
  beforeModelLoad?: (
    model: RuntimeModelRef,
    job: RuntimeJobRecord
  ) => void | Promise<void>;
  afterModelUnload?: (
    model: RuntimeModelRef,
    job: RuntimeJobRecord
  ) => void | Promise<void>;
}

export interface LocalRuntimeConfig {
  modelLoadPolicy: ModelLoadPolicy;
  maxConcurrentHeavyJobs: 1;
  tempDir?: string;
  hooks?: RuntimeModelHooks;
}

export interface RuntimeQueue {
  enqueue(job: RuntimeJob): RuntimeJobRecord;
  cancel(jobId: string): boolean;
  getJob(jobId: string): RuntimeJobRecord | undefined;
  listJobs(): RuntimeJobRecord[];
  runNext(): Promise<RuntimeJobRecord | undefined>;
  runAll(): Promise<RuntimeJobRecord[]>;
}
