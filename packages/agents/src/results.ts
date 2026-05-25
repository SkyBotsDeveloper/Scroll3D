import type { AgentRunResult } from "./types";

export function completedAgentResult<TOutput>(
  output: TOutput,
  options: Partial<Omit<AgentRunResult<TOutput>, "status" | "output">> = {}
): AgentRunResult<TOutput> {
  return {
    status: "completed",
    output,
    artifacts: options.artifacts ?? {},
    nextSuggestions: options.nextSuggestions ?? [],
    warnings: options.warnings ?? [],
    error: null
  };
}

export function failedAgentResult(message: string): AgentRunResult {
  return {
    status: "failed",
    output: null,
    artifacts: {},
    nextSuggestions: [],
    warnings: [message],
    error: message
  };
}

export function cancelledAgentResult(): AgentRunResult {
  return {
    status: "cancelled",
    output: null,
    artifacts: {},
    nextSuggestions: [],
    warnings: ["Agent run was cancelled."],
    error: null
  };
}
