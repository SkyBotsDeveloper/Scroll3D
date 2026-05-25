import type {
  ApiProviderSettings,
  PipelineStage,
  Scroll3DSettings,
  StageProviderPreference
} from "./settings-state";
import { pipelineStages } from "./settings-state";

export interface StageProviderStatus {
  stage: PipelineStage;
  label: string;
  selected: StageProviderPreference;
  status:
    | "configured"
    | "connected"
    | "unavailable"
    | "mock"
    | "missing-secret"
    | "missing-config"
    | "missing-runtime"
    | "model-not-installed";
  providerLabel: string;
  explanation: string;
  missingConfig?: string;
  modelBinding?: string;
}

const stageLabels: Record<PipelineStage, string> = {
  prompt: "Prompt Understanding",
  image: "Image Generation",
  video: "Video Generation",
  frame: "Frame Extraction",
  code: "Website Compilation"
};

const stageProviderTypes: Record<PipelineStage, ApiProviderSettings["type"]> = {
  prompt: "llm",
  image: "image",
  video: "video",
  frame: "frame",
  code: "code"
};

export function resolveProviderStatuses(
  settings: Scroll3DSettings
): StageProviderStatus[] {
  return pipelineStages.map((stage) => resolveProviderStatus(settings, stage));
}

export function resolveProviderStatus(
  settings: Scroll3DSettings,
  stage: PipelineStage
): StageProviderStatus {
  const preference = settings.providerPreferences[stage];
  const resolved = preference === "auto" ? resolveAutoPreference(settings) : preference;

  if (resolved === "mock") {
    return {
      stage,
      label: stageLabels[stage],
      selected: preference,
      status: "mock",
      providerLabel: "Mock provider",
      explanation:
        "Developer preview uses deterministic mock providers. Real provider execution is disabled."
    };
  }

  if (resolved === "api") {
    return resolveApiStatus(settings, stage, preference);
  }

  return resolveLocalStatus(settings, stage, preference);
}

export function updateStagePreference(
  settings: Scroll3DSettings,
  stage: PipelineStage,
  preference: StageProviderPreference
): Scroll3DSettings {
  return {
    ...settings,
    providerPreferences: {
      ...settings.providerPreferences,
      [stage]: preference
    },
    updatedAt: new Date().toISOString()
  };
}

export function checkApiProviderConnection(provider: ApiProviderSettings): {
  status: StageProviderStatus["status"];
  message: string;
} {
  if (!provider.baseUrl.trim()) {
    return {
      status: "missing-config",
      message: `${provider.name || "Provider"} is missing base URL. No network call was made.`
    };
  }

  if (!provider.model?.trim()) {
    return {
      status: "missing-config",
      message: `${provider.name || "Provider"} is missing model name. No network call was made.`
    };
  }

  if (!provider.secretRef.trim()) {
    return {
      status: "missing-secret",
      message: `${provider.name || "Provider"} is missing secretRef. Raw API keys are not stored here.`
    };
  }

  return {
    status: "configured",
    message: `${provider.name || "Provider"} is configured. Real network connection checks are disabled in developer preview.`
  };
}

function resolveAutoPreference(settings: Scroll3DSettings): StageProviderPreference {
  if (settings.allowMockFallback) {
    return "mock";
  }

  if (settings.mode === "api") {
    return "api";
  }

  return "local";
}

function resolveApiStatus(
  settings: Scroll3DSettings,
  stage: PipelineStage,
  selected: StageProviderPreference
): StageProviderStatus {
  const requiredType = stageProviderTypes[stage];
  const provider = settings.apiProviders.find(
    (candidate) => candidate.enabled && candidate.type === requiredType
  );

  if (!provider) {
    return {
      stage,
      label: stageLabels[stage],
      selected,
      status: settings.allowMockFallback ? "mock" : "missing-config",
      providerLabel: settings.allowMockFallback ? "Mock fallback" : "API provider",
      explanation: settings.allowMockFallback
        ? "No enabled API provider is configured, so mock fallback is available."
        : "No enabled API provider is configured for this stage.",
      missingConfig: "Enable an API provider with a base URL and secretRef."
    };
  }

  if (!provider.baseUrl.trim()) {
    return {
      stage,
      label: stageLabels[stage],
      selected,
      status: settings.allowMockFallback ? "mock" : "missing-config",
      providerLabel: settings.allowMockFallback ? "Mock fallback" : provider.name,
      explanation: settings.allowMockFallback
        ? "API provider is missing base URL, so mock fallback is available."
        : "API provider is missing base URL.",
      missingConfig: "Add a base URL. Do not store raw API keys here."
    };
  }

  if (!provider.secretRef.trim()) {
    return {
      stage,
      label: stageLabels[stage],
      selected,
      status: settings.allowMockFallback ? "mock" : "missing-secret",
      providerLabel: settings.allowMockFallback ? "Mock fallback" : provider.name,
      explanation: settings.allowMockFallback
        ? "API provider has no secretRef, so mock fallback is available."
        : "API provider is missing secretRef.",
      missingConfig: "Add a secretRef. Raw API keys stay outside project files."
    };
  }

  return {
    stage,
    label: stageLabels[stage],
    selected,
    status: "configured",
    providerLabel: provider.name,
    explanation:
      "API provider has base URL, model, and secretRef. Real network checks are disabled in developer preview."
  };
}

function resolveLocalStatus(
  settings: Scroll3DSettings,
  stage: PipelineStage,
  selected: StageProviderPreference
): StageProviderStatus {
  if (settings.localRuntime.status === "connected") {
    return {
      stage,
      label: stageLabels[stage],
      selected,
      status: "connected",
      providerLabel: "Local runtime",
      explanation:
        "Local runtime is marked connected. Real model execution is not implemented yet.",
      modelBinding: "model binding pending"
    };
  }

  return {
    stage,
    label: stageLabels[stage],
    selected,
    status: settings.allowMockFallback ? "mock" : "missing-runtime",
    providerLabel: settings.allowMockFallback ? "Mock fallback" : "Local runtime",
    explanation: settings.allowMockFallback
      ? "Local runtime is not connected, so mock fallback is available."
      : "Local runtime is not connected.",
    missingConfig:
      "Run pnpm setup:local in a stopped server session, then connect runtime later.",
    modelBinding: "model not installed"
  };
}

export function summarizeProviderDecisions(settings: Scroll3DSettings): string[] {
  return resolveProviderStatuses(settings).map(
    (status) =>
      `${status.label}: ${status.providerLabel} (${status.status}) - ${status.explanation}`
  );
}
