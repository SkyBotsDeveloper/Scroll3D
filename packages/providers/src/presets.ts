import type { AnyProviderConfig, ProviderPreset } from "./types";

function config(config: AnyProviderConfig): AnyProviderConfig {
  return config;
}

export const mockProviderPresets: ProviderPreset[] = [
  {
    id: "mock-local-llm",
    name: "Mock Local LLM",
    description: "Offline deterministic prompt-understanding provider.",
    config: config({
      id: "mock-local-llm",
      name: "Mock Local LLM",
      type: "llm",
      mode: "local",
      enabled: true,
      provider: "mock",
      model: "mock-local-llm",
      capabilities: [
        {
          id: "structured-output",
          description: "Returns deterministic structured planning output.",
          heavy: false
        }
      ]
    })
  },
  {
    id: "mock-api-llm",
    name: "Mock API LLM",
    description: "API-mode deterministic prompt-understanding provider.",
    config: config({
      id: "mock-api-llm",
      name: "Mock API LLM",
      type: "llm",
      mode: "api",
      enabled: false,
      provider: "mock",
      model: "mock-api-llm",
      baseUrl: "https://example.invalid/llm",
      secretRef: {
        id: "mock-api-llm-key",
        label: "Mock API LLM key"
      },
      capabilities: [
        {
          id: "structured-output",
          description: "Returns deterministic structured planning output.",
          heavy: false
        }
      ]
    })
  },
  {
    id: "mock-image",
    name: "Mock Image Provider",
    description: "Deterministic image artifact provider.",
    config: config({
      id: "mock-image",
      name: "Mock Image Provider",
      type: "image",
      mode: "api",
      enabled: true,
      provider: "mock",
      model: "mock-image",
      capabilities: [
        {
          id: "image-generation",
          description: "Creates deterministic image artifact references.",
          heavy: true
        }
      ]
    })
  },
  {
    id: "mock-video",
    name: "Mock Video Provider",
    description: "Deterministic video artifact provider.",
    config: config({
      id: "mock-video",
      name: "Mock Video Provider",
      type: "video",
      mode: "api",
      enabled: true,
      provider: "mock",
      model: "mock-video",
      capabilities: [
        {
          id: "video-generation",
          description: "Creates deterministic video artifact references.",
          heavy: true
        }
      ]
    })
  },
  {
    id: "mock-frame",
    name: "Mock Frame Provider",
    description: "Deterministic local frame manifest provider.",
    config: config({
      id: "mock-frame",
      name: "Mock Frame Provider",
      type: "frame",
      mode: "local",
      enabled: true,
      provider: "mock",
      model: "mock-frame",
      capabilities: [
        {
          id: "frame-extraction",
          description: "Creates deterministic desktop and mobile frame sets.",
          heavy: true
        }
      ]
    })
  },
  {
    id: "mock-code",
    name: "Mock Code Provider",
    description: "Deterministic website compilation provider.",
    config: config({
      id: "mock-code",
      name: "Mock Code Provider",
      type: "code",
      mode: "api",
      enabled: true,
      provider: "mock",
      model: "mock-code",
      capabilities: [
        {
          id: "code-generation",
          description: "Creates deterministic site compilation plans.",
          heavy: false
        }
      ]
    })
  }
];

export function getMockProviderPreset(presetId: string): ProviderPreset | undefined {
  return mockProviderPresets.find((preset) => preset.id === presetId);
}
