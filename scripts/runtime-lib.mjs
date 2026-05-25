import os from "node:os";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const localRuntimeConfigPath = ".scroll3d/local-runtime.config.json";
export const modelDownloadPlanPath = ".scroll3d/model-download-plan.json";

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
    minVramGB: 0,
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

export const modelCatalog = [
  {
    id: "lite-prompt-llm",
    name: "Lite Prompt Planner",
    stage: "prompt",
    providerType: "llm",
    runtime: "ollama",
    status: "not-installed",
    sizeGB: 4
  },
  {
    id: "lite-code-llm",
    name: "Lite Code Planner",
    stage: "code",
    providerType: "code",
    runtime: "scroll3d-runtime",
    status: "not-installed",
    sizeGB: 5
  },
  {
    id: "balanced-image-model",
    name: "Balanced Image Concept Model",
    stage: "image",
    providerType: "image",
    runtime: "comfyui",
    status: "not-installed",
    sizeGB: 16
  },
  {
    id: "balanced-frame-tool",
    name: "Balanced Frame Tool",
    stage: "frame",
    providerType: "frame",
    runtime: "ffmpeg",
    status: "not-installed",
    sizeGB: 1
  },
  {
    id: "pro-video-model",
    name: "Pro Motion Model",
    stage: "video",
    providerType: "video",
    runtime: "comfyui",
    status: "not-installed",
    sizeGB: 80
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

export function createLocalRuntimeConfigPlan(specs, selectedPackId) {
  const recommendation = recommendModelPack(specs);
  const selectedPack = selectedPackId
    ? modelPacks.find((pack) => pack.id === selectedPackId)
    : recommendation.recommendedPack;
  const pack = selectedPack ?? recommendation.recommendedPack;
  const now = new Date().toISOString();
  const models = getModelsForPack(pack.id);

  return {
    version: "0.1",
    runtime: {
      id: "scroll3d-local-runtime",
      name: "Scroll3D Local Runtime",
      url: "http://127.0.0.1:4317",
      status: "configured"
    },
    modelCacheDir: ".scroll3d/models",
    selectedModelPack: pack.id,
    installedModels: {
      models
    },
    providerBindings: Object.fromEntries(
      models.map((model) => [model.stage, model.id])
    ),
    maxConcurrentHeavyJobs: 1,
    allowMockFallback: true,
    createdAt: now,
    updatedAt: now
  };
}

export function writeLocalRuntimeConfigPlan(filePath, config) {
  assertSafeLocalJsonPath(filePath);

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function readLocalRuntimeConfig(filePath = localRuntimeConfigPath) {
  if (!existsSync(filePath)) {
    return null;
  }

  assertSafeLocalJsonPath(filePath);

  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function createModelDownloadPlan(specs, selectedPackId, catalog = modelCatalog) {
  const pack =
    modelPacks.find((candidate) => candidate.id === selectedPackId) ??
    recommendModelPack(specs).recommendedPack;
  const selectedModels = getModelsForPack(pack.id, catalog);
  const entries = selectedModels.map((model) => createDownloadPlanEntry(model, specs));
  const warnings = [
    "Downloads are disabled in this phase.",
    "No model files are downloaded and no models are executed.",
    ...pack.warnings,
    ...(typeof specs.vramGB === "number"
      ? []
      : ["VRAM was not detected; local media models may need hybrid/mock fallback."]),
    ...(typeof specs.freeDiskGB === "number"
      ? []
      : ["Free disk could not be detected; verify storage before future downloads."])
  ];

  return {
    id: `model-download-plan-${pack.id}`,
    selectedPack: pack.id,
    entries,
    summary: summarizeDownloadPlan(pack.id, entries, warnings),
    warnings,
    createdAt: new Date().toISOString(),
    metadata: {
      downloadsEnabled: false,
      selectedPackName: pack.name
    }
  };
}

export function writeModelDownloadPlan(filePath, plan) {
  assertSafeLocalJsonPath(filePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
}

export function formatDownloadPlan(plan) {
  const lines = [
    `Selected pack: ${plan.selectedPack}`,
    `Models planned: ${String(plan.summary.entryCount)}`,
    `Estimated download size: ${String(plan.summary.totalEstimatedDownloadGB)} GB`,
    `Estimated disk after install: ${String(
      plan.summary.totalEstimatedDiskAfterInstallGB
    )} GB`,
    `Unsupported entries: ${String(plan.summary.unsupportedCount)}`,
    "",
    "Entries:"
  ];

  for (const entry of plan.entries) {
    lines.push(
      `- ${entry.name} (${entry.stage}/${entry.runtime}): ${entry.status}, ${entry.action}, approx ${String(
        entry.estimatedSizeGB
      )} GB`
    );

    for (const risk of entry.risks) {
      lines.push(`  risk: ${risk}`);
    }
  }

  lines.push("", "Warnings:");
  for (const warning of plan.warnings) {
    lines.push(`- ${warning}`);
  }

  lines.push("", "No downloads are performed by this command.");

  return lines.join("\n");
}

export function createOfflineHandshakeResponse(config) {
  const runtimeUrl = config?.runtime?.url?.trim() ? config.runtime.url : null;
  const status = runtimeUrl ? "unavailable" : "not-configured";
  const models = config?.installedModels?.models ?? [];

  return {
    status,
    runtimeUrl,
    version: {
      protocolVersion: "0.1",
      runtimeVersion: "offline-placeholder",
      compatible: false
    },
    health: {
      status,
      message: "No local runtime server was contacted in this phase."
    },
    capabilities: [
      {
        id: "sequential-heavy-jobs",
        name: "Sequential heavy jobs",
        enabled: true,
        description: "Runtime must run one heavy model job at a time."
      },
      {
        id: "model-registry",
        name: "Model registry",
        enabled: false,
        description: "Future runtime can report installed and ready models."
      }
    ],
    stageSupport: ["prompt", "image", "video", "frame", "code"].map((stage) => {
      const stageModels = models.filter((model) => model.stage === stage);

      return {
        stage,
        supported: stageModels.some((model) => model.status === "ready"),
        readyModels: stageModels
          .filter((model) => model.status === "ready")
          .map((model) => model.id),
        missingModels: stageModels
          .filter((model) => model.status !== "ready")
          .map((model) => model.id)
      };
    }),
    maxConcurrentHeavyJobs: 1,
    oneModelAtATime: true,
    modelRegistrySummary: {
      totalModels: models.length,
      readyModels: models.filter((model) => model.status === "ready").length,
      installedModels: models.filter((model) => model.status === "installed").length,
      notInstalledModels: models.filter((model) => model.status === "not-installed")
        .length
    },
    warnings: [
      "Offline handshake only; no runtime server was contacted.",
      "No models were downloaded or executed."
    ],
    checkedAt: new Date().toISOString()
  };
}

export function formatHandshakeResponse(response) {
  const lines = [
    `Status: ${response.status}`,
    `Runtime URL: ${response.runtimeUrl ?? "not configured"}`,
    `Protocol: ${response.version.protocolVersion}`,
    `Compatible: ${response.version.compatible ? "yes" : "no"}`,
    `One model at a time: ${response.oneModelAtATime ? "yes" : "no"}`,
    `Max concurrent heavy jobs: ${String(response.maxConcurrentHeavyJobs)}`,
    `Models ready: ${String(response.modelRegistrySummary.readyModels)}/${String(
      response.modelRegistrySummary.totalModels
    )}`,
    "",
    "Stage support:"
  ];

  for (const stage of response.stageSupport) {
    lines.push(
      `- ${stage.stage}: ${stage.supported ? "ready" : "not ready"}; missing ${
        stage.missingModels.length ? stage.missingModels.join(", ") : "none"
      }`
    );
  }

  lines.push("", "Warnings:");
  for (const warning of response.warnings) {
    lines.push(`- ${warning}`);
  }

  return lines.join("\n");
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
    checkOptionalBinary("ffmpeg", ["-version"], "FFmpeg"),
    {
      name: "Local runtime config",
      status: "info",
      message: "Run pnpm setup:local to create .scroll3d/local-runtime.config.json."
    },
    {
      name: "Local runtime endpoint",
      status: "info",
      message:
        "Expected future runtime endpoint is http://127.0.0.1:4317; no probe was made."
    }
  ];

  return checks;
}

function getModelsForPack(packId, catalog = modelCatalog) {
  if (packId === "custom") {
    return [];
  }

  const idsByPack = {
    lite: ["lite-prompt-llm", "lite-code-llm"],
    balanced: [
      "lite-prompt-llm",
      "lite-code-llm",
      "balanced-image-model",
      "balanced-frame-tool"
    ],
    pro: [
      "lite-prompt-llm",
      "lite-code-llm",
      "balanced-image-model",
      "balanced-frame-tool",
      "pro-video-model"
    ]
  };

  return catalog
    .filter((model) => idsByPack[packId]?.includes(model.id))
    .map((model) => ({ ...model, notes: ["Planning entry only. No download."] }));
}

export function mergeCatalogWithConfig(config) {
  const configuredModels = config?.installedModels?.models ?? [];

  return modelCatalog.map((model) => {
    const configured = configuredModels.find((candidate) => candidate.id === model.id);

    return configured ? { ...model, status: configured.status } : model;
  });
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

function createDownloadPlanEntry(model, specs) {
  const risks = [];

  if (model.sizeGB >= 32) {
    risks.push("large-download");
  }

  if ((model.minVramGB ?? 0) >= 8 || (model.recommendedVramGB ?? 0) >= 12) {
    risks.push("high-vram");
  }

  if (model.stage === "video" || model.runtime === "comfyui") {
    risks.push("experimental");
  }

  if (model.runtime !== "ffmpeg") {
    risks.push("license-review");
  }

  if (typeof specs.freeDiskGB === "number" && specs.freeDiskGB < model.sizeGB) {
    risks.push("disk-space-warning");
  }

  if (specs.arch && !["x64", "arm64"].includes(specs.arch)) {
    risks.push("unsupported-platform");
  }

  return {
    modelId: model.id,
    stage: model.stage,
    name: model.name,
    runtime: model.runtime,
    providerType: model.providerType,
    estimatedSizeGB: model.sizeGB,
    estimatedDiskAfterInstallGB: Math.round(model.sizeGB * 1.2 * 10) / 10,
    requirements: [
      {
        type: "ram",
        label: "System RAM",
        required: `${String(model.minRamGB ?? 1)} GB minimum`,
        available: formatGB(specs.totalRamGB),
        satisfied:
          typeof specs.totalRamGB !== "number" ||
          specs.totalRamGB >= (model.minRamGB ?? 1)
      },
      {
        type: "vram",
        label: "GPU VRAM",
        required: `${String(model.minVramGB ?? 0)} GB minimum`,
        available: formatGB(specs.vramGB),
        satisfied:
          !model.minVramGB ||
          typeof specs.vramGB !== "number" ||
          specs.vramGB >= model.minVramGB
      },
      {
        type: "disk",
        label: "Free disk",
        required: `${String(model.sizeGB)} GB estimated`,
        available: formatGB(specs.freeDiskGB),
        satisfied:
          typeof specs.freeDiskGB !== "number" || specs.freeDiskGB >= model.sizeGB
      }
    ],
    source: {
      type: model.runtime === "ffmpeg" ? "external-tool" : "placeholder",
      label:
        model.runtime === "ffmpeg"
          ? "External FFmpeg install"
          : "Placeholder future model source",
      reference:
        model.runtime === "ffmpeg" ? undefined : `placeholder://models/${model.id}`,
      requiresLicenseReview: model.runtime !== "ffmpeg"
    },
    action: model.runtime === "ffmpeg" ? "external-tool" : "future-download",
    status: risks.includes("unsupported-platform")
      ? "not-supported-yet"
      : "waiting-confirmation",
    installInstructions: [
      {
        step: 1,
        title: "Review requirements",
        note: `Review resource and license requirements for ${model.name}.`
      },
      {
        step: 2,
        title: "Wait for explicit download support",
        command:
          model.runtime === "ffmpeg"
            ? "Install FFmpeg separately if needed"
            : "future download command",
        note: "Downloads are not implemented in this phase."
      }
    ],
    risks,
    warnings: ["No download is performed by this plan."]
  };
}

function summarizeDownloadPlan(selectedPack, entries, warnings) {
  return {
    selectedPack,
    entryCount: entries.length,
    stages: [...new Set(entries.map((entry) => entry.stage))],
    totalEstimatedDownloadGB:
      Math.round(
        entries.reduce((total, entry) => total + entry.estimatedSizeGB, 0) * 10
      ) / 10,
    totalEstimatedDiskAfterInstallGB:
      Math.round(
        entries.reduce(
          (total, entry) => total + (entry.estimatedDiskAfterInstallGB ?? 0),
          0
        ) * 10
      ) / 10,
    unsupportedCount: entries.filter((entry) =>
      entry.risks.includes("unsupported-platform")
    ).length,
    riskyEntryCount: entries.filter((entry) => entry.risks.length > 0).length,
    readyCount: entries.filter((entry) => entry.status === "ready").length,
    noDownloadsPerformed: true,
    warnings
  };
}

function assertSafeLocalJsonPath(filePath) {
  if (!filePath.endsWith(".json") || filePath.includes("..")) {
    throw new Error("Unsafe local runtime path.");
  }
}
