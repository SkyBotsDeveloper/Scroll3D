import { pipelineStages, type PipelineStage } from "./settings-state";

export interface SystemSpecs {
  os: string;
  arch: string;
  cpuModel?: string;
  cpuCores?: number;
  totalRamGB?: number;
  freeRamGB?: number;
  gpuName?: string;
  vramGB?: number;
  freeDiskGB?: number;
  nodeVersion?: string;
}

export interface SystemScanResult {
  specs: SystemSpecs;
  warnings: string[];
  detectedAt: string;
  confidence: "low" | "medium" | "high";
}

export interface ModelPack {
  id: "lite" | "balanced" | "pro" | "custom";
  name: string;
  description: string;
  minRamGB: number;
  recommendedRamGB: number;
  minVramGB?: number;
  recommendedVramGB?: number;
  estimatedDiskGB: number;
  modelIds: string[];
  stagesSupported: PipelineStage[];
  providers: Array<"mock" | "local" | "api">;
  warnings: string[];
}

export interface ModelCatalogEntry {
  id: string;
  name: string;
  stage: PipelineStage;
  providerType: "llm" | "image" | "video" | "frame" | "code";
  runtime: "ollama" | "comfyui" | "ffmpeg" | "scroll3d-runtime" | "api" | "mock";
  sizeGB: number;
  status:
    | "not-installed"
    | "installed"
    | "downloading"
    | "ready"
    | "unavailable"
    | "error";
  notes: string[];
}

export interface IncompatibleModelPack {
  pack: ModelPack;
  reasons: string[];
}

export interface ModelRecommendation {
  recommendedPack: ModelPack;
  compatiblePacks: ModelPack[];
  incompatiblePacks: IncompatibleModelPack[];
  reasons: string[];
  warnings: string[];
}

export interface ModelDownloadPlanEntry {
  modelId: string;
  stage: PipelineStage;
  name: string;
  runtime: ModelCatalogEntry["runtime"];
  estimatedSizeGB: number;
  action: "future-download" | "external-tool" | "manual-install" | "skip";
  status: "waiting-confirmation" | "not-supported-yet" | "installed" | "ready";
  risks: string[];
  warnings: string[];
}

export interface ModelDownloadPlan {
  selectedPack: ModelPack["id"];
  entries: ModelDownloadPlanEntry[];
  summary: {
    entryCount: number;
    totalEstimatedDownloadGB: number;
    totalEstimatedDiskAfterInstallGB: number;
    unsupportedCount: number;
    riskyEntryCount: number;
    stages: PipelineStage[];
  };
  warnings: string[];
}

const modelPacks: ModelPack[] = [
  {
    id: "lite",
    name: "Lite",
    description: "CPU-first planning pack for low-spec local development.",
    minRamGB: 4,
    recommendedRamGB: 8,
    minVramGB: 0,
    recommendedVramGB: 0,
    estimatedDiskGB: 12,
    modelIds: ["lite-prompt-llm", "lite-code-llm"],
    stagesSupported: ["prompt", "code"],
    providers: ["mock", "local"],
    warnings: ["Image and video stages stay mock/API-assisted in this phase."]
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
    modelIds: [
      "lite-prompt-llm",
      "lite-code-llm",
      "balanced-image-model",
      "balanced-frame-tool"
    ],
    stagesSupported: ["prompt", "image", "frame", "code"],
    providers: ["mock", "local", "api"],
    warnings: ["Real model downloads are not implemented yet."]
  },
  {
    id: "pro",
    name: "Pro",
    description: "Higher-memory target for future local image and video workflows.",
    minRamGB: 32,
    recommendedRamGB: 64,
    minVramGB: 12,
    recommendedVramGB: 16,
    estimatedDiskGB: 140,
    modelIds: [
      "lite-prompt-llm",
      "lite-code-llm",
      "balanced-image-model",
      "balanced-frame-tool",
      "pro-video-model"
    ],
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
    modelIds: [],
    stagesSupported: ["prompt", "image", "video", "frame", "code"],
    providers: ["mock", "local", "api"],
    warnings: ["Manual setup path. Real downloads are not implemented yet."]
  }
];

const modelCatalog: ModelCatalogEntry[] = [
  {
    id: "lite-prompt-llm",
    name: "Lite Prompt Planner",
    stage: "prompt",
    providerType: "llm",
    runtime: "ollama",
    sizeGB: 4,
    status: "not-installed",
    notes: ["Future local prompt model. No download in this phase."]
  },
  {
    id: "lite-code-llm",
    name: "Lite Code Planner",
    stage: "code",
    providerType: "code",
    runtime: "scroll3d-runtime",
    sizeGB: 5,
    status: "not-installed",
    notes: ["Future local code model. No execution in this phase."]
  },
  {
    id: "balanced-image-model",
    name: "Balanced Image Concept Model",
    stage: "image",
    providerType: "image",
    runtime: "comfyui",
    sizeGB: 16,
    status: "not-installed",
    notes: ["ComfyUI image workflow placeholder."]
  },
  {
    id: "balanced-frame-tool",
    name: "Balanced Frame Tool",
    stage: "frame",
    providerType: "frame",
    runtime: "ffmpeg",
    sizeGB: 1,
    status: "not-installed",
    notes: ["FFmpeg frame tooling placeholder."]
  },
  {
    id: "pro-video-model",
    name: "Pro Motion Model",
    stage: "video",
    providerType: "video",
    runtime: "comfyui",
    sizeGB: 80,
    status: "not-installed",
    notes: ["Future local video model placeholder."]
  }
];

export function listModelPacks(): ModelPack[] {
  return modelPacks.map((pack) => ({
    ...pack,
    modelIds: [...pack.modelIds],
    stagesSupported: [...pack.stagesSupported],
    providers: [...pack.providers],
    warnings: [...pack.warnings]
  }));
}

export function listModelCatalog(): ModelCatalogEntry[] {
  return modelCatalog.map((model) => ({
    ...model,
    notes: [...model.notes]
  }));
}

export function recommendModelPack(specs: SystemSpecs): ModelRecommendation {
  const packs = listModelPacks();
  const compatiblePacks = packs.filter((pack) => isPackCompatible(specs, pack));
  const incompatiblePacks = packs
    .filter((pack) => !isPackCompatible(specs, pack))
    .map((pack) => ({
      pack,
      reasons: getIncompatibilityReasons(specs, pack)
    }));
  const recommendedPack =
    specs.totalRamGB === undefined
      ? getLitePack(packs)
      : (chooseRecommendedPack(specs, compatiblePacks) ?? getLitePack(packs));

  return {
    recommendedPack,
    compatiblePacks,
    incompatiblePacks,
    reasons: [
      `Recommended ${recommendedPack.name} based on ${formatGB(
        specs.totalRamGB
      )} RAM and ${formatGB(specs.vramGB)} VRAM.`,
      "This is a planning recommendation only; no models are downloaded."
    ],
    warnings: [
      ...recommendedPack.warnings,
      ...(specs.totalRamGB === undefined
        ? ["Hardware details are incomplete in browser scan."]
        : []),
      ...(specs.vramGB === undefined
        ? ["VRAM was not detected; hybrid/mock fallback may be needed."]
        : [])
    ]
  };
}

export function createModelDownloadPlan(
  specs: SystemSpecs,
  selectedPack: ModelPack["id"] | "auto"
): ModelDownloadPlan {
  const packs = listModelPacks();
  const recommendation = recommendModelPack(specs);
  const pack =
    selectedPack === "auto"
      ? recommendation.recommendedPack
      : (packs.find((candidate) => candidate.id === selectedPack) ??
        recommendation.recommendedPack);
  const catalog = listModelCatalog();
  const entries = catalog
    .filter((model) => pack.modelIds.includes(model.id))
    .map((model) => createPlanEntry(model, specs));
  const warnings = [
    "Downloads are disabled in this phase.",
    "Use the plan to understand resource requirements before future install commands.",
    ...pack.warnings,
    ...(typeof specs.vramGB === "number"
      ? []
      : ["VRAM was not detected; local media models may need mock/API fallback."])
  ];

  return {
    selectedPack: pack.id,
    entries,
    summary: {
      entryCount: entries.length,
      totalEstimatedDownloadGB: roundGB(
        entries.reduce((total, entry) => total + entry.estimatedSizeGB, 0)
      ),
      totalEstimatedDiskAfterInstallGB: roundGB(
        entries.reduce((total, entry) => total + entry.estimatedSizeGB * 1.2, 0)
      ),
      unsupportedCount: entries.filter((entry) => entry.status === "not-supported-yet")
        .length,
      riskyEntryCount: entries.filter((entry) => entry.risks.length > 0).length,
      stages: pipelineStages.filter((stage) =>
        entries.some((entry) => entry.stage === stage)
      )
    },
    warnings
  };
}

export function isPackCompatible(specs: SystemSpecs, pack: ModelPack): boolean {
  return getIncompatibilityReasons(specs, pack).length === 0;
}

export function formatSystemSpecs(specs: SystemSpecs): string {
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
    `Node: ${specs.nodeVersion ?? "Browser"}`
  ].join("\n");
}

function getIncompatibilityReasons(specs: SystemSpecs, pack: ModelPack): string[] {
  const reasons: string[] = [];

  if (typeof specs.totalRamGB === "number" && specs.totalRamGB < pack.minRamGB) {
    reasons.push(`Requires at least ${String(pack.minRamGB)} GB RAM.`);
  }

  if (
    typeof pack.minVramGB === "number" &&
    pack.minVramGB > 0 &&
    typeof specs.vramGB === "number" &&
    specs.vramGB < pack.minVramGB
  ) {
    reasons.push(`Requires at least ${String(pack.minVramGB)} GB VRAM.`);
  }

  return reasons;
}

function formatGB(value: number | undefined): string {
  return typeof value === "number" ? `${String(value)} GB` : "Unknown";
}

function getLitePack(packs: ModelPack[]): ModelPack {
  const lite = packs.find((pack) => pack.id === "lite") ?? packs[0];

  if (!lite) {
    throw new Error("No model packs are defined.");
  }

  return lite;
}

function chooseRecommendedPack(
  specs: SystemSpecs,
  compatiblePacks: ModelPack[]
): ModelPack | undefined {
  const nonCustom = compatiblePacks.filter((pack) => pack.id !== "custom");

  if (
    typeof specs.totalRamGB === "number" &&
    specs.totalRamGB >= 32 &&
    typeof specs.vramGB === "number" &&
    specs.vramGB >= 12
  ) {
    return nonCustom.find((pack) => pack.id === "pro");
  }

  if (typeof specs.totalRamGB === "number" && specs.totalRamGB >= 12) {
    return nonCustom.find((pack) => pack.id === "balanced");
  }

  return nonCustom.find((pack) => pack.id === "lite");
}

function createPlanEntry(
  model: ModelCatalogEntry,
  specs: SystemSpecs
): ModelDownloadPlanEntry {
  const risks = [
    ...(model.sizeGB >= 32 ? ["large-download"] : []),
    ...(model.stage === "image" || model.stage === "video" ? ["high-vram"] : []),
    ...(model.runtime === "comfyui" ? ["experimental"] : []),
    ...(model.runtime === "ffmpeg" ? [] : ["license-review"]),
    ...(specs.arch && !["x64", "arm64"].includes(specs.arch)
      ? ["unsupported-platform"]
      : [])
  ];

  return {
    modelId: model.id,
    stage: model.stage,
    name: model.name,
    runtime: model.runtime,
    estimatedSizeGB: model.sizeGB,
    action: model.runtime === "ffmpeg" ? "external-tool" : "future-download",
    status: risks.includes("unsupported-platform")
      ? "not-supported-yet"
      : model.status === "ready" || model.status === "installed"
        ? model.status
        : "waiting-confirmation",
    risks,
    warnings: [
      ...model.notes,
      "No model download or model execution is performed in this phase."
    ]
  };
}

function roundGB(value: number): number {
  return Math.round(value * 10) / 10;
}
