import type { LocalRuntimeSettings, RuntimeConnectionStatus } from "./settings-state";

export interface RuntimeStatusResult {
  status: RuntimeConnectionStatus;
  message: string;
  checkedAt: string;
}

export interface RuntimeHandshakeDisplay {
  status: "not-configured" | "unavailable" | "reachable" | "incompatible";
  runtimeUrl: string | null;
  oneModelAtATime: true;
  maxConcurrentHeavyJobs: 1;
  summary: string;
  warnings: string[];
}

export function checkLocalRuntimeStatus(
  settings: LocalRuntimeSettings
): RuntimeStatusResult {
  if (!settings.runtimeUrl.trim()) {
    return {
      status: "unavailable",
      message:
        "Runtime URL is missing. Real runtime connection is not implemented yet.",
      checkedAt: new Date().toISOString()
    };
  }

  return {
    status: "disconnected",
    message:
      "Local runtime connection check is a placeholder. Run pnpm setup:local for planning.",
    checkedAt: new Date().toISOString()
  };
}

export function formatRuntimeStatus(status: RuntimeConnectionStatus): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "disconnected":
      return "Disconnected";
    case "unavailable":
      return "Unavailable";
    case "unknown":
      return "Unknown";
  }
}

export function createOfflineRuntimeHandshakeDisplay(
  settings: LocalRuntimeSettings
): RuntimeHandshakeDisplay {
  const runtimeUrl = settings.runtimeUrl.trim() ? settings.runtimeUrl : null;
  const status = runtimeUrl ? "unavailable" : "not-configured";
  const modelCount = settings.installedModels.length;

  return {
    status,
    runtimeUrl,
    oneModelAtATime: true,
    maxConcurrentHeavyJobs: 1,
    summary: `Runtime ${status} at ${runtimeUrl ?? "not configured"}. ${String(
      modelCount
    )} models are listed in browser settings.`,
    warnings: [
      "Handshake is offline/simulated in this phase.",
      "No local runtime server is contacted from the browser.",
      "No model download or model execution is performed."
    ]
  };
}
