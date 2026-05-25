import { describe, expect, it } from "vitest";
import {
  InMemorySecretStore,
  MockLLMProvider,
  ProviderRegistry,
  ProviderSelectionPolicy
} from "./index";

function createPolicyFixture() {
  const secretStore = new InMemorySecretStore();
  const registry = new ProviderRegistry({ secretStore });

  registry.registerConfig({
    id: "local-llm",
    name: "Local LLM",
    type: "llm",
    mode: "local",
    enabled: true,
    provider: "ollama",
    model: "llama3.1",
    baseUrl: "http://127.0.0.1:11434"
  });
  registry.registerConfig({
    id: "api-llm",
    name: "API LLM",
    type: "llm",
    mode: "api",
    enabled: true,
    provider: "openai-compatible",
    model: "gpt-compatible",
    baseUrl: "https://api.example.invalid/v1",
    secretRef: {
      id: "api-llm-key"
    }
  });
  registry.registerConfig({
    id: "mock-llm",
    name: "Mock LLM",
    type: "llm",
    mode: "local",
    enabled: true,
    provider: "mock"
  });
  registry.registerConfig({
    id: "api-image",
    name: "API Image",
    type: "image",
    mode: "api",
    enabled: true,
    provider: "openai-compatible",
    model: "image-model",
    baseUrl: "https://api.example.invalid/v1",
    secretRef: {
      id: "image-key"
    }
  });
  registry.registerConfig({
    id: "mock-image",
    name: "Mock Image",
    type: "image",
    mode: "api",
    enabled: true,
    provider: "mock"
  });

  secretStore.setSecret("api-llm-key", "super-secret-llm-key");
  secretStore.setSecret("image-key", "super-secret-image-key");

  return {
    registry,
    secretStore,
    policy: new ProviderSelectionPolicy(registry)
  };
}

describe("ProviderSelectionPolicy", () => {
  it("selects a local provider in local mode", async () => {
    const { policy, secretStore } = createPolicyFixture();

    const result = await policy.selectProvider({
      projectMode: "local",
      requiredProviderType: "llm",
      secretStore,
      allowMockFallback: true
    });

    expect(result.selectedProviderId).toBe("local-llm");
  });

  it("selects an API provider in API mode", async () => {
    const { policy, secretStore } = createPolicyFixture();

    const result = await policy.selectProvider({
      projectMode: "api",
      requiredProviderType: "llm",
      secretStore,
      allowMockFallback: true
    });

    expect(result.selectedProviderId).toBe("api-llm");
  });

  it("selects mixed provider types in hybrid mode", async () => {
    const { policy, secretStore } = createPolicyFixture();

    const llm = await policy.selectProvider({
      projectMode: "hybrid",
      requiredProviderType: "llm",
      preferredModes: {
        llm: ["local", "mock"]
      },
      secretStore,
      allowMockFallback: true
    });
    const image = await policy.selectProvider({
      projectMode: "hybrid",
      requiredProviderType: "image",
      preferredModes: {
        image: ["api", "mock"]
      },
      secretStore,
      allowMockFallback: true
    });

    expect(llm.selectedProviderId).toBe("local-llm");
    expect(image.selectedProviderId).toBe("api-image");
  });

  it("selects a valid preferred provider", async () => {
    const { policy, secretStore } = createPolicyFixture();

    const result = await policy.selectProvider({
      projectMode: "local",
      requiredProviderType: "llm",
      preferredProviderId: "api-llm",
      secretStore,
      allowMockFallback: true
    });

    expect(result.selectedProviderId).toBe("api-llm");
  });

  it("skips disabled providers", async () => {
    const registry = new ProviderRegistry();
    registry.register(new MockLLMProvider({ id: "disabled", name: "Disabled" }), {
      enabled: false
    });
    registry.register(new MockLLMProvider({ id: "enabled", name: "Enabled" }));
    const policy = new ProviderSelectionPolicy(registry);

    const result = await policy.selectProvider({
      projectMode: "local",
      requiredProviderType: "llm",
      allowMockFallback: true
    });

    expect(result.selectedProviderId).toBe("enabled");
  });

  it("skips API providers with missing secrets", async () => {
    const { policy } = createPolicyFixture();

    const result = await policy.selectProvider({
      projectMode: "api",
      requiredProviderType: "llm",
      allowMockFallback: true
    });

    expect(result.selectedProviderId).toBe("mock-llm");
    expect(JSON.stringify(result)).toContain("Missing required secret reference");
  });

  it("falls back to mock when configured", async () => {
    const registry = new ProviderRegistry();
    registry.registerConfig({
      id: "mock-llm",
      name: "Mock LLM",
      type: "llm",
      mode: "local",
      enabled: true,
      provider: "mock"
    });
    const policy = new ProviderSelectionPolicy(registry);

    const result = await policy.selectProvider({
      projectMode: "local",
      requiredProviderType: "llm",
      allowMockFallback: true
    });

    expect(result.selectedProviderId).toBe("mock-llm");
  });

  it("keeps selection explanations secret-safe", async () => {
    const { policy } = createPolicyFixture();

    const result = await policy.selectProvider({
      projectMode: "api",
      requiredProviderType: "llm",
      allowMockFallback: true
    });
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("super-secret");
    expect(serialized).not.toContain("key-value");
  });
});
