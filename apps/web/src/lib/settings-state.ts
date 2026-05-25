import type { ProjectMode } from "@scroll3d/core";
import { readStorageValue, writeStorageValue } from "./storage";
import { redactSecrets } from "./secret-redaction";

export const settingsStorageKey = "scroll3d.settings";

export const pipelineStages = ["prompt", "image", "video", "frame", "code"] as const;
export type PipelineStage = (typeof pipelineStages)[number];

export type StageProviderPreference = "auto" | "local" | "api" | "mock";
export type ModelPackPreference = "lite" | "balanced" | "pro" | "custom" | "auto";
export type ApiProviderType = "llm" | "image" | "video" | "frame" | "code";
export type RuntimeConnectionStatus =
  | "disconnected"
  | "connected"
  | "unavailable"
  | "unknown";

export interface ApiProviderSettings {
  id: string;
  name: string;
  type: ApiProviderType;
  baseUrl: string;
  model?: string;
  secretRef: string;
  enabled: boolean;
}

export interface LocalRuntimeSettings {
  status: RuntimeConnectionStatus;
  runtimeUrl: string;
  configPath: string;
  modelCachePath: string;
  installedModels: string[];
  lastCheckedAt?: string;
}

export interface Scroll3DSettings {
  mode: ProjectMode;
  providerPreferences: Record<PipelineStage, StageProviderPreference>;
  apiProviders: ApiProviderSettings[];
  localRuntime: LocalRuntimeSettings;
  modelPackPreference: ModelPackPreference;
  allowMockFallback: boolean;
  updatedAt: string;
}

export function createDefaultSettings(): Scroll3DSettings {
  return {
    mode: "hybrid",
    providerPreferences: {
      prompt: "auto",
      image: "auto",
      video: "auto",
      frame: "auto",
      code: "auto"
    },
    apiProviders: [
      {
        id: "api-provider-generic-llm",
        name: "Generic API provider",
        type: "llm",
        baseUrl: "https://api.example.invalid/v1",
        model: "model-name",
        secretRef: "primary-api-key",
        enabled: false
      }
    ],
    localRuntime: {
      status: "unknown",
      runtimeUrl: "http://127.0.0.1:17333",
      configPath: ".scroll3d/local-runtime.json",
      modelCachePath: ".scroll3d/models",
      installedModels: []
    },
    modelPackPreference: "auto",
    allowMockFallback: true,
    updatedAt: new Date().toISOString()
  };
}

export function loadSettings(storage?: Storage | null): Scroll3DSettings {
  const stored = readStorageValue(settingsStorageKey, storage);

  if (!stored) {
    return createDefaultSettings();
  }

  try {
    return normalizeSettings(JSON.parse(stored) as unknown);
  } catch {
    return createDefaultSettings();
  }
}

export function saveSettings(
  settings: Scroll3DSettings,
  storage?: Storage | null
): boolean {
  return writeStorageValue(settingsStorageKey, serializeSettings(settings), storage);
}

export function serializeSettings(settings: Scroll3DSettings): string {
  return JSON.stringify(redactSecrets(settings), null, 2);
}

export function updateSettingsTimestamp(settings: Scroll3DSettings): Scroll3DSettings {
  return {
    ...settings,
    updatedAt: new Date().toISOString()
  };
}

export function normalizeSettings(input: unknown): Scroll3DSettings {
  const defaults = createDefaultSettings();

  if (!input || typeof input !== "object") {
    return defaults;
  }

  const candidate = input as Partial<Scroll3DSettings>;
  const mode = isProjectMode(candidate.mode) ? candidate.mode : defaults.mode;
  const modelPackPreference = isModelPackPreference(candidate.modelPackPreference)
    ? candidate.modelPackPreference
    : defaults.modelPackPreference;

  return {
    mode,
    providerPreferences: normalizeProviderPreferences(candidate.providerPreferences),
    apiProviders: Array.isArray(candidate.apiProviders)
      ? candidate.apiProviders.filter(isApiProviderSettings)
      : defaults.apiProviders,
    localRuntime: normalizeLocalRuntime(candidate.localRuntime),
    modelPackPreference,
    allowMockFallback:
      typeof candidate.allowMockFallback === "boolean"
        ? candidate.allowMockFallback
        : defaults.allowMockFallback,
    updatedAt:
      typeof candidate.updatedAt === "string" ? candidate.updatedAt : defaults.updatedAt
  };
}

export function createApiProvider(
  type: ApiProviderType,
  index: number
): ApiProviderSettings {
  return {
    id: `api-provider-${type}-${String(index)}`,
    name: `${type.toUpperCase()} API Provider`,
    type,
    baseUrl: "",
    model: "",
    secretRef: "",
    enabled: false
  };
}

function normalizeProviderPreferences(
  input: unknown
): Record<PipelineStage, StageProviderPreference> {
  const defaults = createDefaultSettings().providerPreferences;
  const candidate = input && typeof input === "object" ? input : {};

  return Object.fromEntries(
    pipelineStages.map((stage) => {
      const value = (candidate as Record<string, unknown>)[stage];

      return [stage, isStageProviderPreference(value) ? value : defaults[stage]];
    })
  ) as Record<PipelineStage, StageProviderPreference>;
}

function normalizeLocalRuntime(input: unknown): LocalRuntimeSettings {
  const defaults = createDefaultSettings().localRuntime;

  if (!input || typeof input !== "object") {
    return defaults;
  }

  const candidate = input as Partial<LocalRuntimeSettings>;

  return {
    status: isRuntimeStatus(candidate.status) ? candidate.status : defaults.status,
    runtimeUrl:
      typeof candidate.runtimeUrl === "string"
        ? candidate.runtimeUrl
        : defaults.runtimeUrl,
    configPath:
      typeof candidate.configPath === "string"
        ? candidate.configPath
        : defaults.configPath,
    modelCachePath:
      typeof candidate.modelCachePath === "string"
        ? candidate.modelCachePath
        : defaults.modelCachePath,
    installedModels: Array.isArray(candidate.installedModels)
      ? candidate.installedModels.filter(
          (model): model is string => typeof model === "string"
        )
      : defaults.installedModels,
    ...(typeof candidate.lastCheckedAt === "string"
      ? { lastCheckedAt: candidate.lastCheckedAt }
      : {})
  };
}

function isApiProviderSettings(value: unknown): value is ApiProviderSettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    isApiProviderType(candidate.type) &&
    typeof candidate.baseUrl === "string" &&
    typeof candidate.secretRef === "string" &&
    typeof candidate.enabled === "boolean"
  );
}

function isProjectMode(value: unknown): value is ProjectMode {
  return value === "local" || value === "api" || value === "hybrid";
}

function isStageProviderPreference(value: unknown): value is StageProviderPreference {
  return value === "auto" || value === "local" || value === "api" || value === "mock";
}

function isModelPackPreference(value: unknown): value is ModelPackPreference {
  return (
    value === "lite" ||
    value === "balanced" ||
    value === "pro" ||
    value === "custom" ||
    value === "auto"
  );
}

function isApiProviderType(value: unknown): value is ApiProviderType {
  return (
    value === "llm" ||
    value === "image" ||
    value === "video" ||
    value === "frame" ||
    value === "code"
  );
}

function isRuntimeStatus(value: unknown): value is RuntimeConnectionStatus {
  return (
    value === "disconnected" ||
    value === "connected" ||
    value === "unavailable" ||
    value === "unknown"
  );
}
