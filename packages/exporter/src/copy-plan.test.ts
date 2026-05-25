import type { Scroll3DProject } from "@scroll3d/core";
import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import { createAssetCopyPlan } from "./assets";
import { createExportCopyPlan, mergeCopyPlans, validateCopyPlan } from "./copy-plan";
import { exportStaticProjectToBundle } from "./exporter";
import { createFrameCopyPlan } from "./frames";
import type { CopyPlan, StaticExportBundle } from "./types";

describe("copy planning", () => {
  it("creates asset copy plan references for sample assets", () => {
    const plan = createAssetCopyPlan(sampleProject, getSampleBundle(), {
      assetMode: "reference"
    });

    expect(plan.entries).toHaveLength(sampleProject.assets.length);
    expect(plan.entries.every((entry) => entry.kind === "asset")).toBe(true);
    expect(plan.entries.every((entry) => entry.action === "reference")).toBe(true);
  });

  it("creates frame copy plan references for frame sets and manifests", () => {
    const plan = createFrameCopyPlan(sampleProject, getSampleBundle(), {
      frameMode: "reference"
    });

    expect(plan.entries.some((entry) => entry.kind === "frame")).toBe(true);
    expect(plan.entries.some((entry) => entry.kind === "manifest")).toBe(true);
  });

  it("skips local absolute asset paths by default", () => {
    const project = withAssets([
      {
        ...getFirstAsset(),
        src: "C:\\private\\asset.png"
      }
    ]);
    const plan = createAssetCopyPlan(project, getSampleBundle(), {
      assetMode: "copy-placeholder"
    });

    expect(plan.entries[0]?.action).toBe("skip");
    expect(plan.warnings[0]?.code).toBe("asset-copy-skipped");
  });

  it("references remote URLs instead of copying them", () => {
    const project = withAssets([
      {
        ...getFirstAsset(),
        src: "https://example.invalid/asset.webp"
      }
    ]);
    const plan = createAssetCopyPlan(project, getSampleBundle(), {
      assetMode: "copy-placeholder"
    });

    expect(plan.entries[0]).toMatchObject({
      sourcePath: "https://example.invalid/asset.webp",
      destinationPath: "https://example.invalid/asset.webp",
      action: "reference"
    });
  });

  it("warns for missing asset paths", () => {
    const project = withAssets([
      {
        ...getFirstAsset(),
        src: ""
      }
    ]);
    const plan = createAssetCopyPlan(project, getSampleBundle());

    expect(plan.entries[0]?.action).toBe("warn");
    expect(plan.warnings[0]?.code).toBe("asset-missing-source");
  });

  it("blocks traversal paths in copy plans", () => {
    const project = withAssets([
      {
        ...getFirstAsset(),
        src: "../private/asset.png"
      }
    ]);
    const plan = createAssetCopyPlan(project, getSampleBundle());

    expect(plan.entries[0]?.action).toBe("skip");
    expect(plan.warnings[0]?.code).toBe("asset-copy-skipped");
  });

  it("merges bundle, asset, and frame copy plans", () => {
    const bundle = getSampleBundle();
    const plan = createExportCopyPlan(sampleProject, bundle);

    expect(plan.entries.length).toBeGreaterThan(bundle.files.length);
    expect(plan.entries.some((entry) => entry.kind === "runtime")).toBe(true);
    expect(plan.entries.some((entry) => entry.kind === "frame")).toBe(true);
  });

  it("validates unsafe copy plan destinations", () => {
    const plan: CopyPlan = {
      id: "unsafe-plan",
      entries: [
        {
          sourcePath: "index.html",
          destinationPath: "../index.html",
          kind: "other",
          required: true,
          action: "copy"
        }
      ],
      warnings: [],
      createdAt: new Date().toISOString()
    };

    expect(validateCopyPlan(plan)[0]?.code).toBe("copy-plan-unsafe-destination");
  });

  it("preserves warnings while merging plans", () => {
    const assetPlan = createAssetCopyPlan(withAssets([]), getSampleBundle());
    const merged = mergeCopyPlans(assetPlan);

    expect(merged.entries).toEqual(assetPlan.entries);
  });
});

function withAssets(assets: Scroll3DProject["assets"]): Scroll3DProject {
  return {
    ...sampleProject,
    assets
  };
}

function getFirstAsset(): Scroll3DProject["assets"][number] {
  const asset = sampleProject.assets[0];

  if (!asset) {
    throw new Error("Expected sample asset.");
  }

  return asset;
}

function getSampleBundle(): StaticExportBundle {
  const result = exportStaticProjectToBundle(sampleProject);

  if (!result.success || !result.bundle) {
    throw new Error("Expected sample export bundle.");
  }

  return result.bundle;
}
