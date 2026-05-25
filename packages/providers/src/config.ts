import { z } from "zod";
import {
  ComfyUIImageProvider,
  ComfyUIVideoProvider,
  FFmpegFrameProvider,
  GenericAPIVideoProvider,
  LocalCodeLLMProvider,
  OllamaLLMProvider,
  OpenAICompatibleCodeProvider,
  OpenAICompatibleImageProvider,
  OpenAICompatibleLLMProvider,
  type ProviderAdapterConfig
} from "./adapters";
import {
  MockCodeProvider,
  MockFrameProvider,
  MockImageProvider,
  MockLLMProvider,
  MockVideoProvider,
  type MockProviderOptions
} from "./mock-providers";
import { InMemorySecretStore, serializeSecretSafe } from "./secrets";
import type {
  AnyProvider,
  AnyProviderConfig,
  ProviderCapability,
  ProviderConfigValidationResult,
  ProviderPreset,
  ProviderRegistration,
  ProviderSecretRef,
  ProviderSecretStore,
  ProviderType
} from "./types";

const ProviderSecretRefSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1).optional()
  })
  .strict();

const ProviderCapabilitySchema = z
  .object({
    id: z.string().trim().min(1),
    description: z.string().trim().min(1),
    heavy: z.boolean()
  })
  .strict();

export const ProviderConfigSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    type: z.enum(["llm", "image", "video", "frame", "code"]),
    mode: z.enum(["local", "api"]),
    enabled: z.boolean(),
    provider: z.enum([
      "mock",
      "openai-compatible",
      "ollama",
      "comfyui",
      "generic-api",
      "ffmpeg",
      "local-code-llm"
    ]),
    model: z.string().trim().min(1).optional(),
    baseUrl: z.string().trim().min(1).optional(),
    endpoint: z.string().trim().min(1).optional(),
    localPath: z.string().trim().min(1).optional(),
    secretRef: ProviderSecretRefSchema.optional(),
    capabilities: z.array(ProviderCapabilitySchema).optional()
  })
  .strict();

export class ProviderConfigLoader {
  private readonly secretStore: ProviderSecretStore;

  constructor(secretStore: ProviderSecretStore = new InMemorySecretStore()) {
    this.secretStore = secretStore;
  }

  validate(config: unknown): ProviderConfigValidationResult {
    const parsed = ProviderConfigSchema.safeParse(config);

    if (!parsed.success) {
      return {
        success: false,
        config: null,
        errors: parsed.error.issues.map((issue) => issue.message)
      };
    }

    return {
      success: true,
      config: parsed.data as AnyProviderConfig,
      errors: []
    };
  }

  load(config: unknown, presetId: string | null = null): ProviderRegistration {
    const validation = this.validate(config);

    if (!validation.success || validation.config === null) {
      throw new Error(
        `Invalid provider config: ${validation.errors.join("; ") || "unknown error"}`
      );
    }

    return createRegistrationFromConfig(validation.config, presetId, this.secretStore);
  }

  loadMany(configs: readonly unknown[]): ProviderRegistration[] {
    return configs.map((config) => this.load(config));
  }

  loadPreset(preset: ProviderPreset): ProviderRegistration {
    return this.load(preset.config, preset.id);
  }
}

export function createRegistrationFromConfig(
  config: AnyProviderConfig,
  presetId: string | null,
  secretStore: ProviderSecretStore
): ProviderRegistration {
  const provider = createProviderFromConfig(config);
  const secretRefs = collectSecretRefs(config);

  return {
    id: config.id,
    provider,
    enabled: config.enabled,
    config: serializeSecretSafe(config, secretStore) as AnyProviderConfig,
    secretRefs,
    presetId,
    createdAt: new Date().toISOString()
  };
}

export function createProviderFromConfig(config: AnyProviderConfig): AnyProvider {
  const options = createMockProviderOptions(config);
  const adapterConfig = createAdapterConfig(config);

  if (config.provider === "mock") {
    switch (config.type) {
      case "llm":
        return new MockLLMProvider(options);
      case "image":
        return new MockImageProvider(options);
      case "video":
        return new MockVideoProvider(options);
      case "frame":
        return new MockFrameProvider(options);
      case "code":
        return new MockCodeProvider(options);
    }
  }

  switch (config.provider) {
    case "openai-compatible":
      if (config.type === "llm") {
        return new OpenAICompatibleLLMProvider(adapterConfig);
      }

      if (config.type === "image") {
        return new OpenAICompatibleImageProvider(adapterConfig);
      }

      if (config.type === "code") {
        return new OpenAICompatibleCodeProvider(adapterConfig);
      }

      break;
    case "ollama":
      if (config.type === "llm") {
        return new OllamaLLMProvider(adapterConfig);
      }

      break;
    case "comfyui":
      if (config.type === "image") {
        return new ComfyUIImageProvider(adapterConfig);
      }

      if (config.type === "video") {
        return new ComfyUIVideoProvider(adapterConfig);
      }

      break;
    case "generic-api":
      if (config.type === "video") {
        return new GenericAPIVideoProvider(adapterConfig);
      }

      break;
    case "ffmpeg":
      if (config.type === "frame") {
        return new FFmpegFrameProvider(adapterConfig);
      }

      break;
    case "local-code-llm":
      if (config.type === "code") {
        return new LocalCodeLLMProvider(adapterConfig);
      }

      break;
  }

  throw new Error(
    `Provider implementation '${config.provider}' does not support type '${config.type}'.`
  );
}

export function sanitizeProviderConfig(config: unknown): unknown {
  return serializeSecretSafe(config);
}

function collectSecretRefs(config: AnyProviderConfig): ProviderSecretRef[] {
  if (!config.secretRef) {
    return [];
  }

  return [{ ...config.secretRef }];
}

export function createCapability(
  id: string,
  description: string,
  heavy: boolean
): ProviderCapability {
  return {
    id,
    description,
    heavy
  };
}

export function isProviderConfigType(
  config: AnyProviderConfig,
  type: ProviderType
): boolean {
  return config.type === type;
}

function createMockProviderOptions(config: AnyProviderConfig): MockProviderOptions {
  return {
    id: config.id,
    name: config.name,
    mode: config.mode,
    ...(config.capabilities ? { capabilities: config.capabilities } : {})
  };
}

function createAdapterConfig(config: AnyProviderConfig): ProviderAdapterConfig {
  return {
    id: config.id,
    name: config.name,
    mode: config.mode,
    ...(config.model ? { model: config.model } : {}),
    ...(config.baseUrl ? { baseUrl: config.baseUrl } : {}),
    ...(config.endpoint ? { endpoint: config.endpoint } : {}),
    ...(config.localPath ? { localPath: config.localPath } : {}),
    ...(config.secretRef ? { secretRef: config.secretRef } : {}),
    ...(config.capabilities ? { capabilities: config.capabilities } : {})
  };
}
