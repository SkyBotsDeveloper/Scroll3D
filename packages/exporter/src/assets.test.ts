import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import { createAssetManifest, generateAssetManifestJson } from "./assets";
import type { ExportWarning } from "./types";

describe("asset handling", () => {
  it("generates an asset manifest in reference mode", () => {
    const warnings: ExportWarning[] = [];
    const manifest = createAssetManifest(sampleProject, "reference", warnings);

    expect(manifest.assets).toHaveLength(2);
    expect(manifest.assets[0]?.mode).toBe("reference");
    expect(warnings).toHaveLength(0);
  });

  it("warns and skips local absolute paths", () => {
    const warnings: ExportWarning[] = [];
    const manifest = createAssetManifest(
      {
        ...sampleProject,
        assets: [
          {
            id: "local-secret",
            type: "image",
            src: "C:/Users/example/secret.png",
            metadata: {}
          }
        ]
      },
      "reference",
      warnings
    );

    expect(manifest.assets).toHaveLength(0);
    expect(warnings[0]?.code).toBe("asset-unsafe-path");
  });

  it("redacts secrets in asset metadata", () => {
    const json = generateAssetManifestJson(
      {
        ...sampleProject,
        assets: [
          {
            id: "asset",
            type: "image",
            src: "/asset.webp",
            metadata: {
              token: "sk-secret-value"
            }
          }
        ]
      },
      "reference",
      []
    );

    expect(json).not.toContain("sk-secret-value");
    expect(json).toContain("[redacted]");
  });
});
