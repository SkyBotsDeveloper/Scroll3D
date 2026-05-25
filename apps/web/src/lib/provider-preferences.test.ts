import { describe, expect, it } from "vitest";
import {
  checkApiProviderConnection,
  resolveProviderStatus,
  resolveProviderStatuses,
  summarizeProviderDecisions,
  updateStagePreference
} from "./provider-preferences";
import { createDefaultSettings } from "./settings-state";

describe("provider preferences", () => {
  it("resolves auto settings to mock fallback by default", () => {
    const status = resolveProviderStatus(createDefaultSettings(), "prompt");

    expect(status.status).toBe("mock");
    expect(status.providerLabel).toBe("Mock provider");
  });

  it("reports missing API provider config with mock fallback", () => {
    const settings = updateStagePreference(createDefaultSettings(), "image", "api");
    const status = resolveProviderStatus(settings, "image");

    expect(status.status).toBe("mock");
    expect(status.missingConfig).toContain("API provider");
  });

  it("marks configured API provider as configured", () => {
    const settings = {
      ...updateStagePreference(createDefaultSettings(), "prompt", "api"),
      apiProviders: [
        {
          id: "api-llm",
          name: "LLM API",
          type: "llm" as const,
          baseUrl: "https://example.invalid/v1",
          model: "mock-model",
          secretRef: "llm-api-key",
          enabled: true
        }
      ]
    };
    const status = resolveProviderStatus(settings, "prompt");

    expect(status.status).toBe("configured");
    expect(status.providerLabel).toBe("LLM API");
  });

  it("summarizes provider decisions for prompt pipeline display", () => {
    const summary = summarizeProviderDecisions(createDefaultSettings());

    expect(summary).toHaveLength(5);
    expect(summary[0]).toContain("Mock provider");
  });

  it("checks API provider config without network calls", () => {
    expect(
      checkApiProviderConnection({
        id: "api",
        name: "API",
        type: "llm",
        baseUrl: "",
        model: "model",
        secretRef: "secret-ref",
        enabled: true
      }).status
    ).toBe("missing-config");
  });

  it("resolves every stage", () => {
    expect(resolveProviderStatuses(createDefaultSettings())).toHaveLength(5);
  });
});
