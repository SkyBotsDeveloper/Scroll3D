import {
  findProviderByType,
  type ProviderArtifact,
  type ProviderContext
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
import type {
  Agent,
  AgentJobSummary,
  AgentOrchestratorOptions,
  PipelineResult
} from "./types";
import type { Scroll3DProject } from "@scroll3d/core";

interface PipelineState {
  plan: WebsitePlan | null;
  image: ImageAgentOutput | null;
  video: VideoAgentOutput | null;
  frameManifest: FrameAgentOutput | null;
  compilation: WebsiteCompilationOutput | null;
}

export class AgentOrchestrator {
  private readonly agents: readonly Agent[];
  private readonly providers: AgentOrchestratorOptions["providers"];
  private readonly logger: AgentOrchestratorOptions["logger"];

  constructor(options: AgentOrchestratorOptions) {
    this.agents = options.agents ?? createDefaultAgents();
    this.providers = options.providers;
    this.logger = options.logger;
  }

  async run(
    project: Scroll3DProject,
    userPrompt: string,
    signal?: AbortSignal
  ): Promise<PipelineResult> {
    const artifacts: Record<string, ProviderArtifact> = {};
    const jobs: AgentJobSummary[] = [];
    const warnings: string[] = [];
    const state: PipelineState = {
      plan: null,
      image: null,
      video: null,
      frameManifest: null,
      compilation: null
    };
    let currentProject = project;

    for (const [index, agent] of this.agents.entries()) {
      const input = buildAgentInput(agent, userPrompt, state);
      const job: AgentJobSummary = {
        id: createJobId(index, agent),
        agentId: agent.id,
        agentName: agent.name,
        agentType: agent.type,
        providerType: agent.requiredProviderType,
        providerId: null,
        status: "pending",
        input,
        output: null,
        error: null,
        startedAt: null,
        completedAt: null
      };

      jobs.push(job);

      if (signal?.aborted) {
        markCancelled(job);

        return {
          status: "cancelled",
          project: currentProject,
          jobs,
          artifacts,
          output: null,
          warnings
        };
      }

      const provider = findProviderByType(this.providers, agent.requiredProviderType);
      const providerContext = createProviderContext(
        project.id,
        job.id,
        signal,
        this.logger
      );

      if (provider === undefined) {
        markFailed(
          job,
          `No available provider for ${agent.name} (${agent.requiredProviderType}).`
        );

        return {
          status: "failed",
          project: currentProject,
          jobs,
          artifacts,
          output: null,
          warnings
        };
      }

      const providerAvailable = await provider.isAvailable(providerContext);

      if (!providerAvailable) {
        markFailed(
          job,
          `No available provider for ${agent.name} (${agent.requiredProviderType}).`
        );

        return {
          status: "failed",
          project: currentProject,
          jobs,
          artifacts,
          output: null,
          warnings
        };
      }

      job.providerId = provider.id;
      job.status = "running";
      job.startedAt = new Date().toISOString();

      const result = await agent.run(input, {
        project: currentProject,
        providers: this.providers,
        artifacts,
        ...(this.logger ? { logger: this.logger } : {}),
        ...(signal ? { signal } : {})
      });

      warnings.push(...result.warnings);
      Object.assign(artifacts, result.artifacts);

      job.output = result.output;
      job.completedAt = new Date().toISOString();

      if (result.status === "cancelled") {
        job.status = "cancelled";

        return {
          status: "cancelled",
          project: currentProject,
          jobs,
          artifacts,
          output: result.output,
          warnings
        };
      }

      if (result.status === "failed") {
        job.status = "failed";
        job.error = result.error ?? `${agent.name} failed.`;

        return {
          status: "failed",
          project: currentProject,
          jobs,
          artifacts,
          output: result.output,
          warnings
        };
      }

      job.status = "completed";

      const nextProject = applyAgentOutputToState(agent, result.output, state);

      if (nextProject !== null) {
        currentProject = nextProject;
      }
    }

    return {
      status: "completed",
      project: currentProject,
      jobs,
      artifacts,
      output: state.compilation,
      warnings
    };
  }
}

function buildAgentInput(
  agent: Agent,
  userPrompt: string,
  state: PipelineState
): unknown {
  switch (agent.type) {
    case "prompt":
      return { prompt: userPrompt };
    case "image":
      if (state.plan === null) {
        throw new Error("Image agent requires a website plan.");
      }

      return { visualPrompt: state.plan.visualPrompt };
    case "video":
      if (state.image === null || state.plan === null) {
        throw new Error("Video agent requires an image and motion prompt.");
      }

      return {
        image: state.image.image,
        motionPrompt: state.plan.motionPrompt
      };
    case "frame":
      if (state.video === null) {
        throw new Error("Frame agent requires a video artifact.");
      }

      return { video: state.video.video };
    case "code":
      if (state.plan === null || state.frameManifest === null) {
        throw new Error("Compilation agent requires a plan and frame manifest.");
      }

      return {
        plan: state.plan,
        frameManifest: state.frameManifest
      };
  }
}

function applyAgentOutputToState(
  agent: Agent,
  output: unknown,
  state: PipelineState
): Scroll3DProject | null {
  switch (agent.type) {
    case "prompt":
      state.plan = WebsitePlanSchema.parse(output);
      return null;
    case "image":
      state.image = ImageAgentOutputSchema.parse(output);
      return null;
    case "video":
      state.video = VideoAgentOutputSchema.parse(output);
      return null;
    case "frame":
      state.frameManifest = FrameAgentOutputSchema.parse(output);
      return null;
    case "code": {
      state.compilation = WebsiteCompilationOutputSchema.parse(output);
      return state.compilation.project as Scroll3DProject;
    }
  }
}

function createJobId(index: number, agent: Agent): string {
  return `job_${String(index + 1).padStart(2, "0")}_${agent.id}`;
}

function markFailed(job: AgentJobSummary, error: string): void {
  job.status = "failed";
  job.error = error;
  job.completedAt = new Date().toISOString();
}

function markCancelled(job: AgentJobSummary): void {
  job.status = "cancelled";
  job.completedAt = new Date().toISOString();
}

function createProviderContext(
  projectId: string,
  jobId: string,
  signal: AbortSignal | undefined,
  logger: AgentOrchestratorOptions["logger"]
): ProviderContext {
  return {
    projectId,
    jobId,
    ...(signal ? { abortSignal: signal } : {}),
    ...(logger ? { logger } : {})
  };
}
