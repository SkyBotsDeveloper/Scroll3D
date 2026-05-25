import type { SystemScanResult, SystemSpecs } from "./model-recommendations";

export function createBrowserSystemScan(): SystemScanResult {
  const navigatorLike = typeof navigator === "undefined" ? undefined : navigator;
  const deviceMemory = getDeviceMemory();
  const specs: SystemSpecs = {
    os: navigatorLike?.userAgent || "Browser",
    arch: "browser",
    ...(navigatorLike?.hardwareConcurrency
      ? { cpuCores: navigatorLike.hardwareConcurrency }
      : {}),
    ...(deviceMemory === undefined ? {} : { totalRamGB: deviceMemory })
  };

  return {
    specs,
    warnings: [
      "Browser scan cannot reliably detect GPU, VRAM, free RAM, or disk capacity.",
      "Run pnpm runtime:scan for a more useful local setup planning scan."
    ],
    detectedAt: new Date().toISOString(),
    confidence: "low"
  };
}

export function createPlaceholderSystemScan(): SystemScanResult {
  return {
    specs: {
      os: "Unknown",
      arch: "unknown"
    },
    warnings: ["System scan has not been run in this browser session."],
    detectedAt: new Date().toISOString(),
    confidence: "low"
  };
}

function getDeviceMemory(): number | undefined {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  const candidate = navigator as Navigator & { deviceMemory?: number };

  return typeof candidate.deviceMemory === "number"
    ? candidate.deviceMemory
    : undefined;
}
