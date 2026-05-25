import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, normalize, sep } from "node:path";
import type {
  LocalModelEntry,
  LocalModelPackSelection,
  LocalModelStatus,
  LocalRuntimeConfigPlan,
  ModelStage,
  RuntimeSystemSpecs,
  Scroll3DLocalRuntimeConfig
} from "./types";
import { getModelsForPack, recommendModelPack } from "./model-catalog";

export function createDefaultLocalRuntimeConfig(
  selectedModelPack: LocalModelPackSelection = "lite"
): Scroll3DLocalRuntimeConfig {
  const now = new Date().toISOString();
  const models = getModelsForPack(selectedModelPack);

  return {
    version: "0.1",
    runtime: {
      id: "scroll3d-local-runtime",
      name: "Scroll3D Local Runtime",
      url: "http://127.0.0.1:4317",
      status: "configured"
    },
    modelCacheDir: ".scroll3d/models",
    selectedModelPack,
    installedModels: {
      models
    },
    providerBindings: createProviderBindings(models),
    maxConcurrentHeavyJobs: 1,
    allowMockFallback: true,
    createdAt: now,
    updatedAt: now
  };
}

export function validateLocalRuntimeConfig(input: unknown): {
  success: boolean;
  config: Scroll3DLocalRuntimeConfig | null;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { success: false, config: null, errors: ["Config must be an object."] };
  }

  const candidate = input as Partial<Scroll3DLocalRuntimeConfig>;

  if (candidate.maxConcurrentHeavyJobs !== 1) {
    errors.push("maxConcurrentHeavyJobs must remain 1.");
  }

  if (!candidate.runtime?.url) {
    errors.push("runtime.url is required.");
  }

  if (!candidate.modelCacheDir) {
    errors.push("modelCacheDir is required.");
  }

  if (!candidate.selectedModelPack) {
    errors.push("selectedModelPack is required.");
  }

  if (JSON.stringify(input).toLowerCase().includes("sk-")) {
    errors.push("Runtime config must not contain raw secret-looking values.");
  }

  return {
    success: errors.length === 0,
    config: errors.length === 0 ? (candidate as Scroll3DLocalRuntimeConfig) : null,
    errors
  };
}

export async function loadLocalRuntimeConfig(
  filePath: string
): Promise<Scroll3DLocalRuntimeConfig> {
  assertSafeConfigPath(filePath);
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  const validation = validateLocalRuntimeConfig(parsed);

  if (!validation.success || !validation.config) {
    throw new Error(`Invalid local runtime config: ${validation.errors.join("; ")}`);
  }

  return validation.config;
}

export async function saveLocalRuntimeConfig(
  filePath: string,
  config: Scroll3DLocalRuntimeConfig
): Promise<void> {
  assertSafeConfigPath(filePath);
  const validation = validateLocalRuntimeConfig(config);

  if (!validation.success) {
    throw new Error(`Invalid local runtime config: ${validation.errors.join("; ")}`);
  }

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function createLocalRuntimeConfigPlan(
  specs: RuntimeSystemSpecs,
  selectedPack?: LocalModelPackSelection
): LocalRuntimeConfigPlan {
  const recommendation = recommendModelPack(specs);
  const packId = selectedPack ?? recommendation.recommendedPack.id;
  const config = createDefaultLocalRuntimeConfig(packId);

  return {
    config,
    specs,
    recommendation,
    warnings: [
      "No model downloads are performed.",
      "No local model execution is performed.",
      ...recommendation.warnings
    ],
    nextSteps: [
      "Restart the web server with pnpm dev.",
      "Open Settings.",
      "Connect the local runtime when a future runtime server is available.",
      "A future explicit download command will install selected models."
    ]
  };
}

export function updateModelStatus(
  config: Scroll3DLocalRuntimeConfig,
  modelId: string,
  status: LocalModelStatus
): Scroll3DLocalRuntimeConfig {
  return {
    ...config,
    installedModels: {
      models: config.installedModels.models.map((model) =>
        model.id === modelId ? { ...model, status } : model
      )
    },
    updatedAt: new Date().toISOString()
  };
}

export function getModelsForStage(
  config: Scroll3DLocalRuntimeConfig,
  stage: ModelStage
): LocalModelEntry[] {
  return config.installedModels.models.filter((model) => model.stage === stage);
}

export function getReadyModels(config: Scroll3DLocalRuntimeConfig): LocalModelEntry[] {
  return config.installedModels.models.filter((model) => model.status === "ready");
}

function createProviderBindings(
  models: LocalModelEntry[]
): Partial<Record<ModelStage, string>> {
  return Object.fromEntries(models.map((model) => [model.stage, model.id]));
}

function assertSafeConfigPath(filePath: string): void {
  const normalized = normalize(filePath);

  if (
    normalized.split(sep).includes("..") ||
    normalized.endsWith(sep) ||
    !normalized.endsWith(".json")
  ) {
    throw new Error("Unsafe local runtime config path.");
  }
}
