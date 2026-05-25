import type { Scroll3DProject } from "@scroll3d/core";
import {
  SequentialJobRunner,
  type RuntimeJob,
  type RuntimeJobRecord
} from "@scroll3d/local-runtime";
import {
  createDefaultProviderRegistry,
  mockProviderPresets,
  type AnyProvider,
  type ProviderArtifact,
  type ProviderLogger,
  type ProviderRegistry
} from "@scroll3d/providers";
import {
  FrameAgentOutputSchema,
  ImageAgentOutputSchema,
  VideoAgentOutputSchema,
  WebsiteCompilationOutputSchema,
  WebsitePlanSchema,
  type FrameAgentOutput,
  type ImageAgentOutput,
  type VideoAgentOutput,
  type WebsiteCompilationOutput,
  type WebsitePlan
} from "./contracts";
import { createDefaultAgents } from "./mock-agents";
import {
  InMemoryPipelineRunStore,
  appendArtifact,
  appendCheckpoint,
  createPipelineRun,
  markPipelineCancelled,
  markPipelineCompleted,
  markPipelineFailed,
  toProviderArtifact,
  updateStepStatus,
  type PipelineRun,
  type PipelineRunStore,
  type PipelineStep
} from "./pipeline-state";
import type { Agent, AgentRunResult } from "./types";

interface QueuedPipelineState {
  plan: WebsitePlan | null;
  image: ImageAgentOutput | null;
  video: VideoAgentOutput | null;
  frameManifest: FrameAgentOutput | null;
  compilation: WebsiteCompilationOutput | null;
}

export interface QueuedAgentPipelineRunnerOptions {
  agents?: readonly Agent[];
  registry?: ProviderRegistry;
  runtime?: SequentialJobRunner;
  store?: PipelineRunStore;
  logger?: ProviderLogger;
}

export class QueuedAgentPipelineRunner {
  private readonly agents: readonly Agent[];
  private readonly registry: ProviderRegistry;
  private readonly runtime: SequentialJobRunner;
  private readonly store: PipelineRunStore;
  private readonly logger: ProviderLogger | undefined;
  private readonly runRuntimeJobs = new Map<string, string[]>();

  constructor(options: QueuedAgentPipelineRunnerOptions = {}) {
    this.agents = options.agents ?? createDefaultAgents();
    this.registry =
      options.registry ?? createDefaultProviderRegistry(mockProviderPresets);
    this.runtime = options.runtime ?? new SequentialJobRunner();
    this.store = options.store ?? new InMemoryPipelineRunStore();
    this.logger = options.logger;
  }

  async run(project: Scroll3DProject, prompt: string): Promise<PipelineRun> {
    const pipelineRun = createPipelineRun(project, prompt, this.agents);
    this.store.save(pipelineRun);

    return this.executeFromStep(project, pipelineRun, 0);
  }

  async retryFailedStep(runId: string, project: Scroll3DProject): Promise<PipelineRun> {
    const run = this.getRunOrThrow(runId);
    const failedStepIndex = run.steps.findIndex((step) => step.status === "failed");

    if (failedStepIndex < 0) {
      return run;
    }

    const failedStep = run.steps[failedStepIndex];

    if (!failedStep) {
      return run;
    }

    resetStepForRetry(failedStep);
    run.status = "pending";
    this.store.save(run);

    return this.executeFromStep(project, run, failedStepIndex);
  }

  getRun(runId: string): PipelineRun | undefined {
    return this.store.get(runId);
  }

  listRuns(): PipelineRun[] {
    return this.store.list();
  }

  cancelRun(runId: string): boolean {
    const run = this.store.get(runId);

    if (!run || ["completed", "failed", "cancelled"].includes(run.status)) {
      return false;
    }

    const runtimeJobIds = this.runRuntimeJobs.get(runId) ?? [];

    for (const runtimeJobId of runtimeJobIds) {
      this.runtime.cancel(runtimeJobId);
    }

    const activeStep = run.steps.find((step) => step.status === "running") ?? null;

    if (activeStep) {
      updateStepStatus(run, activeStep.id, "cancelled");
    }

    markPipelineCancelled(run, activeStep?.id ?? null);
    this.store.save(run);

    return true;
  }

  private async executeFromStep(
    project: Scroll3DProject,
    run: PipelineRun,
    startIndex: number
  ): Promise<PipelineRun> {
    const state = hydrateStateFromRun(run);
    const artifacts = hydrateArtifactsFromRun(run);
    let currentProject = hydrateProjectFromState(project, state);

    run.status = "running";
    this.store.save(run);

    for (let index = startIndex; index < this.agents.length; index += 1) {
      const agent = this.agents[index];
      const step = run.steps[index];

      if (!agent || !step) {
        break;
      }

      const provider = this.resolveProviderForStep(run, step);

      if (!provider) {
        const error = `No enabled provider registered for type '${step.requiredProviderType}'.`;
        updateStepStatus(run, step.id, "failed", { error });
        markPipelineFailed(run, step.id, error);
        this.store.save(run);
        return run;
      }

      const input = buildStepInput(agent, run.prompt, state);
      const runtimeJobId = createRuntimeJobId(run, step);
      const runtimeJob = this.createRuntimeJob({
        run,
        step,
        agent,
        provider,
        project: currentProject,
        input,
        artifacts,
        runtimeJobId
      });

      trackRuntimeJob(this.runRuntimeJobs, run.id, runtimeJobId);
      this.runtime.enqueue(runtimeJob);
      updateStepStatus(run, step.id, "running", { input });
      this.store.save(run);

      const runtimeResult = await this.runtime.runNext();
      const stepResult = applyRuntimeResultToRun(run, step, runtimeResult);

      if (!stepResult.completed) {
        this.store.save(run);
        return run;
      }

      if (stepResult.result.status === "cancelled") {
        updateStepStatus(run, step.id, "cancelled", {
          output: stepResult.result.output
        });
        markPipelineCancelled(run, step.id);
        this.store.save(run);
        return run;
      }

      if (stepResult.result.status === "failed") {
        const error = stepResult.result.error ?? `${agent.name} failed.`;
        updateStepStatus(run, step.id, "failed", {
          output: stepResult.result.output,
          error
        });
        markPipelineFailed(run, step.id, error);
        this.store.save(run);
        return run;
      }

      Object.assign(artifacts, stepResult.result.artifacts);

      for (const [key, artifact] of Object.entries(stepResult.result.artifacts)) {
        appendArtifact(run, step.id, key, artifact);
      }

      updateStepStatus(run, step.id, "completed", {
        output: stepResult.result.output,
        artifacts: step.artifacts
      });
      currentProject = applyStepOutput(
        agent,
        stepResult.result.output,
        state,
        currentProject
      );
      appendCheckpoint(run, step.id);
      this.store.save(run);
    }

    markPipelineCompleted(run);
    this.store.save(run);

    return run;
  }

  private resolveProviderForStep(
    run: PipelineRun,
    step: PipelineStep
  ): AnyProvider | null {
    try {
      return this.registry.resolveRequiredProvider(step.requiredProviderType);
    } catch (error) {
      this.logger?.warn?.("Provider resolution failed.", {
        runId: run.id,
        stepId: step.id,
        error: error instanceof Error ? error.message : "Unknown provider error."
      });
      return null;
    }
  }

  private createRuntimeJob(options: {
    run: PipelineRun;
    step: PipelineStep;
    agent: Agent;
    provider: AnyProvider;
    project: Scroll3DProject;
    input: unknown;
    artifacts: Record<string, ProviderArtifact>;
    runtimeJobId: string;
  }): RuntimeJob<AgentRunResult> {
    return {
      id: options.runtimeJobId,
      name: `${options.run.id}:${options.step.id}`,
      heavy: options.provider.capabilities.some((capability) => capability.heavy),
      priority: 0,
      metadata: {
        runId: options.run.id,
        stepId: options.step.id,
        agentId: options.agent.id,
        providerId: options.provider.id
      },
      run: ({ signal }) =>
        options.agent.run(options.input, {
          project: options.project,
          providers: [options.provider],
          artifacts: options.artifacts,
          ...(this.logger ? { logger: this.logger } : {}),
          signal
        })
    };
  }

  private getRunOrThrow(runId: string): PipelineRun {
    const run = this.store.get(runId);

    if (!run) {
      throw new Error(`Pipeline run not found: ${runId}`);
    }

    return run;
  }
}

function buildStepInput(
  agent: Agent,
  prompt: string,
  state: QueuedPipelineState
): unknown {
  switch (agent.type) {
    case "prompt":
      return { prompt };
    case "image":
      if (!state.plan) {
        throw new Error("Image step requires a website plan.");
      }

      return { visualPrompt: state.plan.visualPrompt };
    case "video":
      if (!state.plan || !state.image) {
        throw new Error("Video step requires a plan and image artifact.");
      }

      return {
        image: state.image.image,
        motionPrompt: state.plan.motionPrompt
      };
    case "frame":
      if (!state.video) {
        throw new Error("Frame step requires a video artifact.");
      }

      return { video: state.video.video };
    case "code":
      if (!state.plan || !state.frameManifest) {
        throw new Error("Code step requires a plan and frame manifest.");
      }

      return {
        plan: state.plan,
        frameManifest: state.frameManifest
      };
  }
}

function applyStepOutput(
  agent: Agent,
  output: unknown,
  state: QueuedPipelineState,
  currentProject: Scroll3DProject
): Scroll3DProject {
  switch (agent.type) {
    case "prompt":
      state.plan = WebsitePlanSchema.parse(output);
      return currentProject;
    case "image":
      state.image = ImageAgentOutputSchema.parse(output);
      return currentProject;
    case "video":
      state.video = VideoAgentOutputSchema.parse(output);
      return currentProject;
    case "frame":
      state.frameManifest = FrameAgentOutputSchema.parse(output);
      return currentProject;
    case "code": {
      state.compilation = WebsiteCompilationOutputSchema.parse(output);
      return state.compilation.project as Scroll3DProject;
    }
  }
}

function hydrateStateFromRun(run: PipelineRun): QueuedPipelineState {
  const state: QueuedPipelineState = {
    plan: null,
    image: null,
    video: null,
    frameManifest: null,
    compilation: null
  };

  for (const step of run.steps) {
    if (step.status !== "completed") {
      continue;
    }

    switch (step.agentType) {
      case "prompt":
        state.plan = WebsitePlanSchema.parse(step.output);
        break;
      case "image":
        state.image = ImageAgentOutputSchema.parse(step.output);
        break;
      case "video":
        state.video = VideoAgentOutputSchema.parse(step.output);
        break;
      case "frame":
        state.frameManifest = FrameAgentOutputSchema.parse(step.output);
        break;
      case "code":
        state.compilation = WebsiteCompilationOutputSchema.parse(step.output);
        break;
    }
  }

  return state;
}

function hydrateArtifactsFromRun(run: PipelineRun): Record<string, ProviderArtifact> {
  return Object.fromEntries(
    Object.entries(run.artifacts).map(([key, artifact]) => [
      key,
      toProviderArtifact(artifact)
    ])
  );
}

function hydrateProjectFromState(
  project: Scroll3DProject,
  state: QueuedPipelineState
): Scroll3DProject {
  if (!state.compilation) {
    return project;
  }

  return state.compilation.project as Scroll3DProject;
}

function applyRuntimeResultToRun(
  run: PipelineRun,
  step: PipelineStep,
  runtimeResult: RuntimeJobRecord | undefined
): { completed: true; result: AgentRunResult } | { completed: false; result: null } {
  if (!runtimeResult) {
    const error = "Runtime queue did not execute the step.";
    updateStepStatus(run, step.id, "failed", { error });
    markPipelineFailed(run, step.id, error);
    return { completed: false, result: null };
  }

  if (runtimeResult.status === "cancelled") {
    updateStepStatus(run, step.id, "cancelled");
    markPipelineCancelled(run, step.id);
    return { completed: false, result: null };
  }

  if (runtimeResult.status === "failed") {
    const error = runtimeResult.error ?? "Runtime job failed.";
    updateStepStatus(run, step.id, "failed", { error });
    markPipelineFailed(run, step.id, error);
    return { completed: false, result: null };
  }

  return {
    completed: true,
    result: runtimeResult.output as AgentRunResult
  };
}

function resetStepForRetry(step: PipelineStep): void {
  step.status = "pending";
  step.error = null;
  step.startedAt = null;
  step.completedAt = null;
  step.retryCount += 1;
}

function createRuntimeJobId(run: PipelineRun, step: PipelineStep): string {
  return `${run.id}_${step.id}_attempt_${String(step.retryCount + 1)}`;
}

function trackRuntimeJob(
  runRuntimeJobs: Map<string, string[]>,
  runId: string,
  runtimeJobId: string
): void {
  const existing = runRuntimeJobs.get(runId) ?? [];
  existing.push(runtimeJobId);
  runRuntimeJobs.set(runId, existing);
}
