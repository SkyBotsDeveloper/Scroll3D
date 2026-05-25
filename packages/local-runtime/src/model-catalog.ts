import type {
  LocalModelEntry,
  LocalModelPackSelection,
  ModelPackDefinition,
  ModelPackRecommendation,
  RuntimeSystemSpecs
} from "./types";

const catalog: LocalModelEntry[] = [
  {
    id: "lite-prompt-llm",
    name: "Lite Prompt Planner",
    stage: "prompt",
    providerType: "llm",
    runtime: "ollama",
    sizeGB: 4,
    minRamGB: 4,
    recommendedRamGB: 8,
    minVramGB: 0,
    recommendedVramGB: 0,
    downloadUrl: "placeholder://models/lite-prompt-llm",
    licenseNote: "User must verify model license before future download.",
    status: "not-installed",
    installCommand: "pnpm runtime:models",
    notes: ["Planning entry only. No model download is implemented yet."]
  },
  {
    id: "lite-code-llm",
    name: "Lite Code Planner",
    stage: "code",
    providerType: "code",
    runtime: "scroll3d-runtime",
    sizeGB: 5,
    minRamGB: 4,
    recommendedRamGB: 8,
    minVramGB: 0,
    recommendedVramGB: 0,
    downloadUrl: "placeholder://models/lite-code-llm",
    licenseNote: "User must verify model license before future download.",
    status: "not-installed",
    installCommand: "pnpm runtime:models",
    notes: ["Future local code model binding placeholder."]
  },
  {
    id: "balanced-image-model",
    name: "Balanced Image Concept Model",
    stage: "image",
    providerType: "image",
    runtime: "comfyui",
    sizeGB: 16,
    minRamGB: 12,
    recommendedRamGB: 24,
    minVramGB: 6,
    recommendedVramGB: 8,
    downloadUrl: "placeholder://models/balanced-image-model",
    licenseNote: "User must verify model license before future download.",
    status: "not-installed",
    installCommand: "pnpm runtime:models",
    notes: ["ComfyUI workflow placeholder. No image generation is implemented."]
  },
  {
    id: "balanced-frame-tool",
    name: "Balanced Frame Tool",
    stage: "frame",
    providerType: "frame",
    runtime: "ffmpeg",
    sizeGB: 1,
    minRamGB: 8,
    recommendedRamGB: 12,
    minVramGB: 0,
    recommendedVramGB: 0,
    status: "not-installed",
    installCommand: "Install FFmpeg separately.",
    notes: ["Optional FFmpeg planning entry. No frame extraction runs now."]
  },
  {
    id: "pro-video-model",
    name: "Pro Motion Model",
    stage: "video",
    providerType: "video",
    runtime: "comfyui",
    sizeGB: 80,
    minRamGB: 32,
    recommendedRamGB: 64,
    minVramGB: 12,
    recommendedVramGB: 16,
    downloadUrl: "placeholder://models/pro-video-model",
    licenseNote: "User must verify model license before future download.",
    status: "not-installed",
    installCommand: "pnpm runtime:models",
    notes: ["Future local video model placeholder."]
  }
];

const packs: ModelPackDefinition[] = [
  {
    id: "lite",
    name: "Lite",
    description: "CPU-first prompt and code planning for low-spec machines.",
    minRamGB: 4,
    recommendedRamGB: 8,
    minVramGB: 0,
    recommendedVramGB: 0,
    estimatedDiskGB: 12,
    modelIds: ["lite-prompt-llm", "lite-code-llm"],
    stagesSupported: ["prompt", "code"],
    warnings: ["Image and video stages should use mock/API fallback."]
  },
  {
    id: "balanced",
    name: "Balanced",
    description: "Local-first prompt, code, image planning, and frame tooling.",
    minRamGB: 12,
    recommendedRamGB: 24,
    minVramGB: 0,
    recommendedVramGB: 8,
    estimatedDiskGB: 48,
    modelIds: [
      "lite-prompt-llm",
      "lite-code-llm",
      "balanced-image-model",
      "balanced-frame-tool"
    ],
    stagesSupported: ["prompt", "image", "frame", "code"],
    warnings: ["If VRAM is unavailable, use hybrid/mock fallback for image work."]
  },
  {
    id: "pro",
    name: "Pro",
    description: "Higher-memory local media workflow target.",
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
    warnings: ["Requires future model manager and explicit downloads."]
  },
  {
    id: "custom",
    name: "Custom",
    description: "Manual user-configurable model bindings.",
    minRamGB: 1,
    recommendedRamGB: 1,
    minVramGB: 0,
    recommendedVramGB: 0,
    estimatedDiskGB: 0,
    modelIds: [],
    stagesSupported: ["prompt", "image", "video", "frame", "code"],
    warnings: ["Advanced path. User chooses models manually."]
  }
];

export function listModelCatalog(): LocalModelEntry[] {
  return catalog.map((model) => cloneModel(model));
}

export function listModelPacks(): ModelPackDefinition[] {
  return packs.map((pack) => ({
    ...pack,
    modelIds: [...pack.modelIds],
    stagesSupported: [...pack.stagesSupported],
    warnings: [...pack.warnings]
  }));
}

export function getModelsForPack(packId: LocalModelPackSelection): LocalModelEntry[] {
  const pack = listModelPacks().find((candidate) => candidate.id === packId);

  if (!pack || pack.id === "custom") {
    return [];
  }

  return listModelCatalog().filter((model) => pack.modelIds.includes(model.id));
}

export function recommendModelPack(specs: RuntimeSystemSpecs): ModelPackRecommendation {
  const allPacks = listModelPacks();
  const compatiblePacks = allPacks.filter((pack) => isPackCompatible(specs, pack));
  const incompatiblePacks = allPacks
    .filter((pack) => !isPackCompatible(specs, pack))
    .map((pack) => ({
      pack,
      reasons: getIncompatibilityReasons(specs, pack)
    }));
  const nonCustom = compatiblePacks.filter((pack) => pack.id !== "custom");
  const recommendedPack =
    chooseRecommendedPack(specs, nonCustom) ??
    allPacks.find((pack) => pack.id === "lite") ??
    allPacks[0];

  if (!recommendedPack) {
    throw new Error("No model packs are defined.");
  }

  return {
    recommendedPack,
    compatiblePacks,
    incompatiblePacks,
    reasons: [
      `Recommended ${recommendedPack.name} for ${formatGB(
        specs.totalRamGB
      )} RAM and ${formatGB(specs.vramGB)} VRAM.`,
      "This is a setup plan only; no models are downloaded."
    ],
    warnings: [
      ...recommendedPack.warnings,
      ...(specs.vramGB === undefined
        ? ["VRAM was not detected, so hybrid/mock fallback may be needed."]
        : []),
      ...(specs.freeDiskGB === undefined
        ? [
            "Free disk could not be detected; verify disk space before future downloads."
          ]
        : [])
    ]
  };
}

export function isPackCompatible(
  specs: RuntimeSystemSpecs,
  pack: ModelPackDefinition
): boolean {
  return getIncompatibilityReasons(specs, pack).length === 0;
}

export function validateModelCatalog(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const model of catalog) {
    if (ids.has(model.id)) {
      errors.push(`Duplicate model id: ${model.id}`);
    }

    ids.add(model.id);

    if (model.sizeGB < 0) {
      errors.push(`Model ${model.id} has invalid size.`);
    }
  }

  for (const pack of packs) {
    for (const modelId of pack.modelIds) {
      if (!ids.has(modelId)) {
        errors.push(`Pack ${pack.id} references missing model ${modelId}.`);
      }
    }
  }

  return errors;
}

function chooseRecommendedPack(
  specs: RuntimeSystemSpecs,
  compatiblePacks: ModelPackDefinition[]
): ModelPackDefinition | undefined {
  if (typeof specs.totalRamGB !== "number") {
    return compatiblePacks.find((pack) => pack.id === "lite");
  }

  if (
    specs.totalRamGB >= 32 &&
    typeof specs.vramGB === "number" &&
    specs.vramGB >= 12
  ) {
    return compatiblePacks.find((pack) => pack.id === "pro");
  }

  if (specs.totalRamGB >= 12) {
    return compatiblePacks.find((pack) => pack.id === "balanced");
  }

  return compatiblePacks.find((pack) => pack.id === "lite");
}

function getIncompatibilityReasons(
  specs: RuntimeSystemSpecs,
  pack: ModelPackDefinition
): string[] {
  const reasons: string[] = [];

  if (typeof specs.totalRamGB === "number" && specs.totalRamGB < pack.minRamGB) {
    reasons.push(`Requires at least ${String(pack.minRamGB)} GB RAM.`);
  }

  if (typeof specs.freeDiskGB === "number" && specs.freeDiskGB < pack.estimatedDiskGB) {
    reasons.push(`Requires about ${String(pack.estimatedDiskGB)} GB free disk.`);
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

function cloneModel(model: LocalModelEntry): LocalModelEntry {
  return {
    ...model,
    notes: [...model.notes]
  };
}

function formatGB(value: number | undefined): string {
  return typeof value === "number" ? `${String(value)} GB` : "Unknown";
}
