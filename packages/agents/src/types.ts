import type { AgentJobStatus, Scroll3DProject } from "@scroll3d/core";
import type {
  AnyProvider,
  ProviderArtifact,
  ProviderLogger,
  ProviderType
} from "@scroll3d/providers";

export type AgentType = "prompt" | "image" | "video" | "frame" | "code";
export type AgentRunStatus = "completed" | "failed" | "cancelled";

export interface AgentContext {
  project: Scroll3DProject;
  providers: readonly AnyProvider[];
  artifacts: Record<string, ProviderArtifact>;
  logger?: ProviderLogger;
  signal?: AbortSignal;
}

export interface AgentRunResult<TOutput = unknown> {
  status: AgentRunStatus;
  output: TOutput | null;
  artifacts: Record<string, ProviderArtifact>;
  nextSuggestions: string[];
  warnings: string[];
  error: string | null;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  requiredProviderType: ProviderType;
  run(input: unknown, context: AgentContext): Promise<AgentRunResult>;
}

export interface AgentJobSummary {
  id: string;
  agentId: string;
  agentName: string;
  agentType: AgentType;
  providerType: ProviderType;
  providerId: string | null;
  status: AgentJobStatus;
  input: unknown;
  output: unknown;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface PipelineResult {
  status: Extract<AgentJobStatus, "completed" | "failed" | "cancelled">;
  project: Scroll3DProject;
  jobs: AgentJobSummary[];
  artifacts: Record<string, ProviderArtifact>;
  output: unknown;
  warnings: string[];
}

export interface AgentOrchestratorOptions {
  agents?: readonly Agent[];
  providers: readonly AnyProvider[];
  logger?: ProviderLogger;
}
