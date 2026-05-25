import type { Asset, Scroll3DProject } from "@scroll3d/core";
import { createExportWarning } from "./errors";
import { redactSecrets, safeJsonStringify, sanitizeReferencePath } from "./sanitize";
import type {
  AssetManifest,
  AssetManifestEntry,
  AssetMode,
  CopyPlan,
  CopyPlanEntry,
  ExportWarning,
  StaticExportBundle
} from "./types";

export function createAssetManifest(
  project: Scroll3DProject,
  mode: AssetMode,
  warnings: ExportWarning[]
): AssetManifest {
  const assets = project.assets.flatMap((asset) => {
    const entry = createAssetEntry(asset, mode, warnings);

    return entry ? [entry] : [];
  });

  return {
    projectId: project.id,
    mode,
    assets,
    notes: createAssetNotes(mode)
  };
}

export function generateAssetManifestJson(
  project: Scroll3DProject,
  mode: AssetMode,
  warnings: ExportWarning[]
): string {
  return safeJsonStringify(createAssetManifest(project, mode, warnings));
}

export function createAssetCopyPlan(
  project: Scroll3DProject,
  bundle: StaticExportBundle,
  options: { assetMode?: AssetMode } = {}
): CopyPlan {
  const mode = options.assetMode ?? "reference";
  const warnings: ExportWarning[] = [];
  const entries = project.assets.map((asset) =>
    createAssetCopyPlanEntry(asset, mode, warnings)
  );

  return {
    id: `asset-copy-plan-${bundle.id}`,
    entries,
    warnings,
    createdAt: new Date().toISOString()
  };
}

function createAssetEntry(
  asset: Asset,
  mode: AssetMode,
  warnings: ExportWarning[]
): AssetManifestEntry | null {
  const safeSource = sanitizeReferencePath(asset.src);

  if (!safeSource) {
    warnings.push(
      createExportWarning(
        "asset-unsafe-path",
        `Asset '${asset.id}' was not exported because its source path is unsafe.`,
        "warning",
        asset.id
      )
    );
    return null;
  }

  return {
    id: asset.id,
    type: asset.type,
    src: safeSource,
    ...(asset.alt ? { alt: asset.alt } : {}),
    metadata: redactSecrets(asset.metadata) as Record<string, unknown>,
    mode
  };
}

function createAssetCopyPlanEntry(
  asset: Asset,
  mode: AssetMode,
  warnings: ExportWarning[]
): CopyPlanEntry {
  const safeSource = sanitizeReferencePath(asset.src);
  const destinationPath = `assets/${sanitizeAssetFilename(asset.src || asset.id)}`;

  if (!asset.src.trim()) {
    warnings.push(
      createExportWarning(
        "asset-missing-source",
        `Asset '${asset.id}' has no source path and cannot be copied.`,
        "warning",
        asset.id
      )
    );

    return {
      sourcePath: asset.src,
      destinationPath,
      kind: "asset",
      required: false,
      action: "warn"
    };
  }

  if (!safeSource) {
    warnings.push(
      createExportWarning(
        "asset-copy-skipped",
        `Asset '${asset.id}' references an unsafe or local absolute path and will not be copied.`,
        "warning",
        asset.id
      )
    );

    return {
      sourcePath: asset.src,
      destinationPath,
      kind: "asset",
      required: false,
      action: "skip"
    };
  }

  if (isRemoteReference(safeSource) || mode === "reference") {
    return {
      sourcePath: safeSource,
      destinationPath: safeSource,
      kind: "asset",
      required: false,
      action: "reference"
    };
  }

  warnings.push(
    createExportWarning(
      "asset-copy-placeholder",
      `Asset '${asset.id}' is marked for future copy support; this phase records a placeholder plan only.`,
      "info",
      asset.id
    )
  );

  return {
    sourcePath: safeSource,
    destinationPath,
    kind: "asset",
    required: false,
    action: "warn"
  };
}

function createAssetNotes(mode: AssetMode): string[] {
  if (mode === "copy-placeholder") {
    return [
      "Asset copy is not implemented in this phase.",
      "This manifest records the files a future disk exporter should copy."
    ];
  }

  return [
    "Assets are referenced by path.",
    "No binary assets are copied into this in-memory export bundle."
  ];
}

function isRemoteReference(path: string): boolean {
  return /^(?:https?:)?\/\//i.test(path) || /^data:/i.test(path);
}

function sanitizeAssetFilename(source: string): string {
  const normalized = source.trim().replaceAll("\\", "/").replace(/^\/+/, "");
  const filename = normalized.split("/").filter(Boolean).at(-1) ?? "asset";

  return filename.replace(/[^a-zA-Z0-9._-]+/g, "-") || "asset";
}
