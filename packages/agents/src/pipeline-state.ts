import type { Scroll3DProject } from "@scroll3d/core";
import type { ProviderArtifact, ProviderType } from "@scroll3d/providers";
import { redactSecrets } from "@scroll3d/providers";
import { createDefaultAgents } from "./mock-agents";
import type { Agent, AgentType } from "./types";

export type PipelineStatus =
  | "idle"
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface PipelineArtifact {
  id: string;
  type: ProviderArtifact["type"];
  path: string;
  metadata: Record<string, unknown>;
  sourceStepId: string;
  createdAt: string;
}

export interface PipelineStep {
  id: string;
  agentId: string;
  agentType: AgentType;
  requiredProviderType: ProviderType;
  status: PipelineStatus;
  input: unknown;
  output: unknown;
  artifacts: Record<string, PipelineArtifact>;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  retryCount: number;
}

export interface PipelineEvent {
  id: string;
  type: string;
  message: string;
  stepId: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface PipelineCheckpoint {
  runId: string;
  status: PipelineStatus;
  stepId: string | null;
  artifactIds: string[];
  createdAt: string;
}

export interface PipelineRun {
  id: string;
  projectId: string;
  prompt: string;
  status: PipelineStatus;
  steps: PipelineStep[];
  artifacts: Record<string, PipelineArtifact>;
  events: PipelineEvent[];
  checkpoints: PipelineCheckpoint[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineRunStore {
  save(run: PipelineRun): void;
  get(runId: string): PipelineRun | undefined;
  list(): PipelineRun[];
  delete(runId: string): boolean;
}

export interface ResumePipelineOptions {
  retryFailed?: boolean;
  rerunCompletedFromStep?: boolean;
  allowCancelled?: boolean;
}

export class InMemoryPipelineRunStore implements PipelineRunStore {
  private readonly runs = new Map<string, PipelineRun>();

  save(run: PipelineRun): void {
    this.runs.set(run.id, clonePipelineRun(run));
  }

  get(runId: string): PipelineRun | undefined {
    const run = this.runs.get(runId);

    return run ? clonePipelineRun(run) : undefined;
  }

  list(): PipelineRun[] {
    return Array.from(this.runs.values()).map((run) => clonePipelineRun(run));
  }

  delete(runId: string): boolean {
    return this.runs.delete(runId);
  }
}

export function createPipelineRun(
  project: Scroll3DProject,
  prompt: string,
  agents: readonly Agent[] = createDefaultAgents()
): PipelineRun {
  const now = new Date().toISOString();

  return {
    id: createPipelineRunId(project.id, prompt),
    projectId: project.id,
    prompt,
    status: "pending",
    steps: agents.map((agent, index) => ({
      id: createPipelineStepId(index, agent),
      agentId: agent.id,
      agentType: agent.type,
      requiredProviderType: agent.requiredProviderType,
      status: "pending",
      input: null,
      output: null,
      artifacts: {},
      error: null,
      startedAt: null,
      completedAt: null,
      retryCount: 0
    })),
    artifacts: {},
    events: [
      {
        id: createEventId("pipeline-created"),
        type: "pipeline-created",
        message: "Pipeline run created.",
        stepId: null,
        createdAt: now,
        metadata: {}
      }
    ],
    checkpoints: [],
    createdAt: now,
    updatedAt: now
  };
}

export function updateStepStatus(
  run: PipelineRun,
  stepId: string,
  status: PipelineStatus,
  updates: Partial<
    Pick<PipelineStep, "input" | "output" | "artifacts" | "error" | "retryCount">
  > = {}
): PipelineRun {
  const step = getStepOrThrow(run, stepId);
  const now = new Date().toISOString();

  step.status = status;
  step.input = "input" in updates ? updates.input : step.input;
  step.output = "output" in updates ? updates.output : step.output;
  step.artifacts = updates.artifacts ?? step.artifacts;
  step.error = "error" in updates ? (updates.error ?? null) : step.error;
  step.retryCount = updates.retryCount ?? step.retryCount;

  if (status === "running" && step.startedAt === null) {
    step.startedAt = now;
  }

  if (["completed", "failed", "cancelled"].includes(status)) {
    step.completedAt = now;
  }

  run.updatedAt = now;

  appendEvent(run, {
    type: `step-${status}`,
    message: `Pipeline step ${step.id} marked ${status}.`,
    stepId,
    metadata: {
      agentId: step.agentId
    }
  });

  return run;
}

export function appendArtifact(
  run: PipelineRun,
  stepId: string,
  key: string,
  artifact: ProviderArtifact
): PipelineArtifact {
  const step = getStepOrThrow(run, stepId);
  const pipelineArtifact: PipelineArtifact = {
    id: artifact.id,
    type: artifact.type,
    path: artifact.path,
    metadata: artifact.metadata,
    sourceStepId: stepId,
    createdAt: new Date().toISOString()
  };

  step.artifacts[key] = pipelineArtifact;
  run.artifacts[key] = pipelineArtifact;
  run.updatedAt = pipelineArtifact.createdAt;

  appendEvent(run, {
    type: "artifact-added",
    message: `Pipeline artifact '${key}' recorded.`,
    stepId,
    metadata: {
      artifactId: artifact.id,
      artifactType: artifact.type
    }
  });

  return pipelineArtifact;
}

export function appendEvent(
  run: PipelineRun,
  event: Omit<PipelineEvent, "id" | "createdAt">
): PipelineEvent {
  const pipelineEvent: PipelineEvent = {
    ...event,
    id: createEventId(event.type),
    createdAt: new Date().toISOString(),
    metadata: redactSecrets(event.metadata) as Record<string, unknown>
  };

  run.events.push(pipelineEvent);
  run.updatedAt = pipelineEvent.createdAt;

  return pipelineEvent;
}

export function appendCheckpoint(
  run: PipelineRun,
  stepId: string | null
): PipelineCheckpoint {
  const checkpoint: PipelineCheckpoint = {
    runId: run.id,
    status: run.status,
    stepId,
    artifactIds: Object.values(run.artifacts).map((artifact) => artifact.id),
    createdAt: new Date().toISOString()
  };

  run.checkpoints.push(checkpoint);
  run.updatedAt = checkpoint.createdAt;

  return checkpoint;
}

export function markPipelineCompleted(run: PipelineRun): PipelineRun {
  run.status = "completed";
  run.updatedAt = new Date().toISOString();
  appendEvent(run, {
    type: "pipeline-completed",
    message: "Pipeline run completed.",
    stepId: null,
    metadata: {}
  });
  appendCheckpoint(run, null);

  return run;
}

export function markPipelineFailed(
  run: PipelineRun,
  stepId: string,
  error: string
): PipelineRun {
  run.status = "failed";
  run.updatedAt = new Date().toISOString();
  appendEvent(run, {
    type: "pipeline-failed",
    message: error,
    stepId,
    metadata: {}
  });
  appendCheckpoint(run, stepId);

  return run;
}

export function markPipelineCancelled(
  run: PipelineRun,
  stepId: string | null,
  message = "Pipeline run cancelled."
): PipelineRun {
  run.status = "cancelled";
  run.updatedAt = new Date().toISOString();
  appendEvent(run, {
    type: "pipeline-cancelled",
    message,
    stepId,
    metadata: {}
  });
  appendCheckpoint(run, stepId);

  return run;
}

export function serializePipelineRun(run: PipelineRun): PipelineRun {
  return redactSecrets(clonePipelineRun(run)) as PipelineRun;
}

export function getNextRunnableStepIndex(
  run: PipelineRun,
  options: ResumePipelineOptions = {}
): number {
  if (run.status === "completed") {
    return -1;
  }

  if (run.status === "cancelled" && options.allowCancelled !== true) {
    return -1;
  }

  const failedStepIndex = run.steps.findIndex((step) => step.status === "failed");

  if (failedStepIndex >= 0) {
    return options.retryFailed === true ? failedStepIndex : -1;
  }

  const cancelledStepIndex = run.steps.findIndex((step) => step.status === "cancelled");

  if (cancelledStepIndex >= 0) {
    return options.allowCancelled === true ? cancelledStepIndex : -1;
  }

  const runningStepIndex = run.steps.findIndex((step) => step.status === "running");

  if (runningStepIndex >= 0) {
    return runningStepIndex;
  }

  return run.steps.findIndex((step) => step.status === "pending");
}

export function preparePipelineRunForResume(
  run: PipelineRun,
  startIndex: number,
  options: ResumePipelineOptions = {}
): PipelineRun {
  const startStep = run.steps[startIndex];

  if (!startStep) {
    return run;
  }

  if (startStep.status === "completed" && options.rerunCompletedFromStep !== true) {
    return run;
  }

  const resetStepIds = new Set<string>();

  for (let index = startIndex; index < run.steps.length; index += 1) {
    const step = run.steps[index];

    if (!step) {
      continue;
    }

    resetStepIds.add(step.id);
    resetStepForResume(step, {
      incrementRetry: index === startIndex && startStep.status === "failed"
    });
  }

  run.artifacts = Object.fromEntries(
    Object.entries(run.artifacts).filter(
      ([, artifact]) => !resetStepIds.has(artifact.sourceStepId)
    )
  );

  run.status = "pending";
  run.updatedAt = new Date().toISOString();
  appendEvent(run, {
    type: "pipeline-resume-prepared",
    message: `Pipeline run prepared to resume from ${startStep.id}.`,
    stepId: startStep.id,
    metadata: {
      retryFailed: options.retryFailed === true,
      rerunCompletedFromStep: options.rerunCompletedFromStep === true
    }
  });

  return run;
}

export function toProviderArtifact(artifact: PipelineArtifact): ProviderArtifact {
  return {
    id: artifact.id,
    type: artifact.type,
    path: artifact.path,
    metadata: artifact.metadata
  };
}

function getStepOrThrow(run: PipelineRun, stepId: string): PipelineStep {
  const step = run.steps.find((candidate) => candidate.id === stepId);

  if (!step) {
    throw new Error(`Pipeline step not found: ${stepId}`);
  }

  return step;
}

function clonePipelineRun(run: PipelineRun): PipelineRun {
  return structuredClone(run);
}

function resetStepForResume(
  step: PipelineStep,
  options: { incrementRetry: boolean }
): void {
  step.status = "pending";
  step.input = null;
  step.output = null;
  step.artifacts = {};
  step.error = null;
  step.startedAt = null;
  step.completedAt = null;

  if (options.incrementRetry) {
    step.retryCount += 1;
  }
}

function createPipelineRunId(projectId: string, prompt: string): string {
  const promptSlug = prompt
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return `run_${projectId}_${promptSlug || "prompt"}`;
}

function createPipelineStepId(index: number, agent: Agent): string {
  return `step_${String(index + 1).padStart(2, "0")}_${agent.id}`;
}

function createEventId(type: string): string {
  return `${type}_${globalThis.crypto.randomUUID()}`;
}
