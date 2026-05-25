import type { LocalRuntimeSettings, RuntimeConnectionStatus } from "./settings-state";

export interface RuntimeStatusResult {
  status: RuntimeConnectionStatus;
  message: string;
  checkedAt: string;
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
