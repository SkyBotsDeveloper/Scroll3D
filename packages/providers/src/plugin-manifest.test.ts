import { describe, expect, it } from "vitest";
import {
  listProviderPluginManifests,
  listProviderPluginManifestsByCapability,
  listProviderPluginManifestsByMode,
  safeParseProviderPluginManifest,
  validateProviderPluginManifest
} from "./plugin-manifest";

describe("provider plugin manifests", () => {
  it("validates all bundled provider plugin manifests", () => {
    const manifests = listProviderPluginManifests();

    expect(manifests.length).toBeGreaterThan(0);

    for (const manifest of manifests) {
      expect(validateProviderPluginManifest(manifest).success).toBe(true);
    }
  });

  it("keeps bundled provider IDs unique", () => {
    const manifests = listProviderPluginManifests();
    const ids = manifests.map((manifest) => manifest.providerId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("rejects manifests missing required display metadata", () => {
    const result = safeParseProviderPluginManifest({
      schemaVersion: "1",
      providerId: "broken.provider"
    });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("filters manifests by mode", () => {
    const mock = listProviderPluginManifestsByMode("mock");
    const local = listProviderPluginManifestsByMode("local");
    const api = listProviderPluginManifestsByMode("api");

    expect(mock.every((manifest) => manifest.mode === "mock")).toBe(true);
    expect(local.every((manifest) => manifest.mode === "local")).toBe(true);
    expect(api.every((manifest) => manifest.mode === "api")).toBe(true);
  });

  it("filters manifests by capability", () => {
    const frameProviders = listProviderPluginManifestsByCapability("frame-extraction");

    expect(frameProviders.length).toBeGreaterThan(0);
    expect(
      frameProviders.every((manifest) =>
        manifest.capabilities.some((capability) => capability.id === "frame-extraction")
      )
    ).toBe(true);
  });

  it("uses secret references instead of raw keys", () => {
    const serialized = JSON.stringify(listProviderPluginManifests());

    expect(serialized).toContain("openai.main");
    expect(serialized).toContain("replicate.primary");
    expect(serialized).not.toContain("sk-");
    expect(serialized).not.toContain("api_key");
  });
});
