import type {
  LocalRuntimeCapability,
  LocalRuntimeHandshakeRequest,
  LocalRuntimeHandshakeResponse,
  LocalRuntimeStageSupport,
  ModelStage,
  RuntimeHandshakeStatus,
  Scroll3DLocalRuntimeConfig
} from "./types";

const stages: ModelStage[] = ["prompt", "image", "video", "frame", "code"];

export function createHandshakeRequest(
  config: Scroll3DLocalRuntimeConfig
): LocalRuntimeHandshakeRequest {
  return {
    runtimeUrl: config.runtime.url.trim() ? config.runtime.url : null,
    clientVersion: config.version,
    requestedStages: getConfiguredStages(config),
    maxConcurrentHeavyJobs: 1,
    checkedAt: new Date().toISOString()
  };
}

export function createOfflineHandshakeResponse(
  config: Scroll3DLocalRuntimeConfig,
  reason = "No local runtime server was contacted in this phase."
): LocalRuntimeHandshakeResponse {
  const runtimeUrl = config.runtime.url.trim() ? config.runtime.url : null;
  const status: RuntimeHandshakeStatus = runtimeUrl ? "unavailable" : "not-configured";
  const modelRegistrySummary = summarizeRegistry(config);

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
      message: reason
    },
    capabilities: createCapabilities(false),
    stageSupport: createStageSupport(config),
    maxConcurrentHeavyJobs: 1,
    oneModelAtATime: true,
    modelRegistrySummary,
    warnings: [
      reason,
      "Handshake is offline/simulated; no model server was started.",
      "No model download or model execution happened."
    ],
    checkedAt: new Date().toISOString()
  };
}

export function validateHandshakeResponse(response: unknown): {
  success: boolean;
  response: LocalRuntimeHandshakeResponse | null;
  errors: string[];
} {
  const errors: string[] = [];

  if (!response || typeof response !== "object") {
    return {
      success: false,
      response: null,
      errors: ["Handshake response must be an object."]
    };
  }

  const candidate = response as Partial<LocalRuntimeHandshakeResponse>;

  if (!isHandshakeStatus(candidate.status)) {
    errors.push("Invalid runtime handshake status.");
  }

  if (candidate.maxConcurrentHeavyJobs !== 1) {
    errors.push("maxConcurrentHeavyJobs must be 1.");
  }

  if (candidate.oneModelAtATime !== true) {
    errors.push("oneModelAtATime must be true.");
  }

  if (!candidate.version?.protocolVersion) {
    errors.push("protocolVersion is required.");
  }

  if (!Array.isArray(candidate.stageSupport)) {
    errors.push("stageSupport must be an array.");
  }

  if (JSON.stringify(response).toLowerCase().includes("sk-")) {
    errors.push("Handshake response must not contain raw secret-looking values.");
  }

  return {
    success: errors.length === 0,
    response: errors.length === 0 ? (candidate as LocalRuntimeHandshakeResponse) : null,
    errors
  };
}

export function summarizeRuntimeHandshake(
  response: LocalRuntimeHandshakeResponse
): string {
  const ready = response.modelRegistrySummary.readyModels;
  const total = response.modelRegistrySummary.totalModels;
  const url = response.runtimeUrl ?? "not configured";

  return `Runtime ${response.status} at ${url}. ${String(
    ready
  )}/${String(total)} models ready. One-model-at-a-time: enabled.`;
}

export function isRuntimeCompatible(response: LocalRuntimeHandshakeResponse): boolean {
  return response.status === "reachable" && response.version.compatible;
}

function createCapabilities(enabled: boolean): LocalRuntimeCapability[] {
  return [
    {
      id: "sequential-heavy-jobs",
      name: "Sequential heavy jobs",
      enabled: true,
      description: "Runtime must run only one heavy model job at a time."
    },
    {
      id: "model-registry",
      name: "Model registry",
      enabled,
      description: "Runtime can report installed and ready local models."
    },
    {
      id: "stage-execution",
      name: "Stage execution",
      enabled,
      description: "Runtime can execute prompt/image/video/frame/code stages."
    }
  ];
}

function createStageSupport(
  config: Scroll3DLocalRuntimeConfig
): LocalRuntimeStageSupport[] {
  return stages.map((stage) => {
    const models = config.installedModels.models.filter(
      (model) => model.stage === stage
    );

    return {
      stage,
      supported: models.some((model) => model.status === "ready"),
      readyModels: models
        .filter((model) => model.status === "ready")
        .map((model) => model.id),
      missingModels: models
        .filter((model) => model.status !== "ready")
        .map((model) => model.id)
    };
  });
}

function summarizeRegistry(config: Scroll3DLocalRuntimeConfig) {
  const models = config.installedModels.models;

  return {
    totalModels: models.length,
    readyModels: models.filter((model) => model.status === "ready").length,
    installedModels: models.filter((model) => model.status === "installed").length,
    notInstalledModels: models.filter((model) => model.status === "not-installed")
      .length
  };
}

function getConfiguredStages(config: Scroll3DLocalRuntimeConfig): ModelStage[] {
  const configured = new Set(config.installedModels.models.map((model) => model.stage));

  return stages.filter((stage) => configured.has(stage));
}

function isHandshakeStatus(value: unknown): value is RuntimeHandshakeStatus {
  return (
    value === "unknown" ||
    value === "reachable" ||
    value === "incompatible" ||
    value === "unavailable" ||
    value === "not-configured" ||
    value === "error"
  );
}
