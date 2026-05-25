import os from "node:os";
import { execFileSync } from "node:child_process";

export const modelPacks = [
  {
    id: "lite",
    name: "Lite",
    description: "Small local planning pack for CPU-first experiments.",
    minRamGB: 4,
    recommendedRamGB: 8,
    minVramGB: 0,
    recommendedVramGB: 0,
    estimatedDiskGB: 12,
    stagesSupported: ["prompt", "code"],
    providers: ["mock", "local"],
    warnings: ["Image and video stages remain mock/API-assisted in this phase."]
  },
  {
    id: "balanced",
    name: "Balanced",
    description:
      "General local-first pack target for prompt, code, and light media planning.",
    minRamGB: 12,
    recommendedRamGB: 24,
    minVramGB: 6,
    recommendedVramGB: 8,
    estimatedDiskGB: 48,
    stagesSupported: ["prompt", "image", "frame", "code"],
    providers: ["mock", "local", "api"],
    warnings: ["Real downloads are not implemented yet."]
  },
  {
    id: "pro",
    name: "Pro",
    description: "Higher-memory target for future local image/video workflows.",
    minRamGB: 32,
    recommendedRamGB: 64,
    minVramGB: 12,
    recommendedVramGB: 16,
    estimatedDiskGB: 140,
    stagesSupported: ["prompt", "image", "video", "frame", "code"],
    providers: ["mock", "local", "api"],
    warnings: ["Requires later model manager and downloads."]
  },
  {
    id: "custom",
    name: "Custom",
    description: "Manual model selection for advanced self-hosting setups.",
    minRamGB: 1,
    recommendedRamGB: 1,
    minVramGB: 0,
    recommendedVramGB: 0,
    estimatedDiskGB: 0,
    stagesSupported: ["prompt", "image", "video", "frame", "code"],
    providers: ["mock", "local", "api"],
    warnings: ["Manual setup path. Real downloads are not implemented yet."]
  }
];

export function scanSystemSpecs() {
  return {
    os: `${os.type()} ${os.release()}`,
    arch: os.arch(),
    cpuModel: os.cpus()[0]?.model,
    cpuCores: os.cpus().length,
    totalRamGB: roundGB(os.totalmem()),
    freeRamGB: roundGB(os.freemem()),
    gpuName: undefined,
    vramGB: undefined,
    freeDiskGB: undefined,
    nodeVersion: process.version
  };
}

export function recommendModelPack(specs) {
  const compatible = modelPacks.filter((pack) => isPackCompatible(specs, pack));
  const nonCustomCompatible = compatible.filter((pack) => pack.id !== "custom");
  const recommended =
    [...nonCustomCompatible].reverse()[0] ??
    modelPacks.find((pack) => pack.id === "lite") ??
    modelPacks[0];

  return {
    recommendedPack: recommended,
    compatiblePacks: compatible,
    incompatiblePacks: modelPacks.filter((pack) => !compatible.includes(pack)),
    reasons: buildReasons(specs, recommended),
    warnings: [
      "No model downloads or model execution happen in this phase.",
      ...(recommended?.warnings ?? [])
    ]
  };
}

export function isPackCompatible(specs, pack) {
  const ram = specs.totalRamGB;
  const vram = specs.vramGB;

  if (typeof ram === "number" && ram < pack.minRamGB) {
    return false;
  }

  if (
    typeof pack.minVramGB === "number" &&
    pack.minVramGB > 0 &&
    typeof vram === "number" &&
    vram < pack.minVramGB
  ) {
    return false;
  }

  return true;
}

export function formatSystemSpecs(specs) {
  return [
    `OS: ${specs.os}`,
    `Architecture: ${specs.arch}`,
    `CPU: ${specs.cpuModel ?? "Unknown"}`,
    `CPU cores: ${String(specs.cpuCores ?? "Unknown")}`,
    `Total RAM: ${formatGB(specs.totalRamGB)}`,
    `Free RAM: ${formatGB(specs.freeRamGB)}`,
    `GPU: ${specs.gpuName ?? "Not detected"}`,
    `VRAM: ${formatGB(specs.vramGB)}`,
    `Free disk: ${formatGB(specs.freeDiskGB)}`,
    `Node: ${specs.nodeVersion ?? "Unknown"}`
  ].join("\n");
}

export function checkDoctor() {
  const checks = [
    {
      name: "Node.js",
      status: "ok",
      message: `Detected ${process.version}.`
    },
    {
      name: "Corepack/pnpm",
      status: "info",
      message: "Use Corepack with pnpm 11 for this repo."
    },
    checkOptionalBinary("ffmpeg", ["-version"], "FFmpeg")
  ];

  return checks;
}

function checkOptionalBinary(binary, args, name) {
  try {
    execFileSync(binary, args, { stdio: "ignore" });

    return {
      name,
      status: "ok",
      message: `${name} is available.`
    };
  } catch {
    return {
      name,
      status: "warning",
      message: `${name} was not found. This is optional until real frame extraction is implemented.`
    };
  }
}

function buildReasons(specs, pack) {
  if (!pack) {
    return ["Could not choose a model pack."];
  }

  return [
    `Selected ${pack.name} for ${formatGB(specs.totalRamGB)} RAM and ${formatGB(
      specs.vramGB
    )} VRAM.`,
    "Real model downloads will be implemented in a later phase."
  ];
}

function formatGB(value) {
  return typeof value === "number" ? `${String(value)} GB` : "Unknown";
}

function roundGB(bytes) {
  return Math.round((bytes / 1024 ** 3) * 10) / 10;
}
