import { describe, expect, it } from "vitest";
import {
  createDefaultProviderRegistry,
  InMemorySecretStore,
  mockProviderPresets,
  MockImageProvider,
  MockLLMProvider,
  ProviderRegistry
} from "./index";

describe("ProviderRegistry", () => {
  it("registers and lists providers", () => {
    const registry = new ProviderRegistry();

    registry.register(new MockLLMProvider({ id: "llm-a", name: "LLM A" }));

    expect(registry.get("llm-a")?.provider.type).toBe("llm");
    expect(registry.list()).toHaveLength(1);
  });

  it("rejects duplicate provider IDs", () => {
    const registry = new ProviderRegistry();

    registry.register(new MockLLMProvider({ id: "duplicate", name: "First" }));

    expect(() =>
      registry.register(new MockLLMProvider({ id: "duplicate", name: "Second" }))
    ).toThrow("Provider already registered: duplicate");
  });

  it("resolves enabled providers by type", () => {
    const registry = createDefaultProviderRegistry(mockProviderPresets);

    expect(registry.resolveRequiredProvider("llm").id).toBe("mock-local-llm");
    expect(registry.resolveRequiredProvider("image").id).toBe("mock-image");
  });

  it("resolves a preferred provider even when disabled", () => {
    const registry = createDefaultProviderRegistry(mockProviderPresets);

    expect(registry.get("mock-api-llm")?.enabled).toBe(false);
    expect(registry.resolveRequiredProvider("llm", "mock-api-llm").id).toBe(
      "mock-api-llm"
    );
  });

  it("ignores disabled providers unless explicitly requested", () => {
    const registry = new ProviderRegistry();

    registry.register(new MockLLMProvider({ id: "disabled-llm", name: "Disabled" }), {
      enabled: false
    });
    registry.register(new MockLLMProvider({ id: "enabled-llm", name: "Enabled" }));

    expect(registry.resolveRequiredProvider("llm").id).toBe("enabled-llm");
    expect(registry.resolveRequiredProvider("llm", "disabled-llm").id).toBe(
      "disabled-llm"
    );
  });

  it("redacts secret values from serialized output", () => {
    const secretStore = new InMemorySecretStore();
    secretStore.setSecret("image-key", "super-secret-key");
    const registry = new ProviderRegistry({ secretStore });

    registry.registerConfig({
      id: "secret-image",
      name: "Secret Image",
      type: "image",
      mode: "api",
      enabled: true,
      provider: "mock",
      baseUrl: "https://example.invalid/image",
      secretRef: {
        id: "image-key",
        label: "Image API key"
      }
    });

    const serialized = JSON.stringify(registry);

    expect(serialized).not.toContain("super-secret-key");
    expect(serialized).toContain("[redacted]");
  });

  it("filters by type and mode", () => {
    const registry = new ProviderRegistry();

    registry.register(new MockLLMProvider({ id: "local-llm", name: "Local LLM" }));
    registry.register(
      new MockImageProvider({ id: "api-image", name: "API Image", mode: "api" })
    );

    expect(registry.listByType("llm").map((entry) => entry.id)).toEqual(["local-llm"]);
    expect(registry.listByMode("api").map((entry) => entry.id)).toEqual(["api-image"]);
  });
});
