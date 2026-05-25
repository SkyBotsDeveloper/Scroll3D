import type { Asset, Scroll3DProject } from "@scroll3d/core";
import { createExportWarning } from "./errors";
import { redactSecrets, safeJsonStringify, sanitizeReferencePath } from "./sanitize";
import type {
  AssetManifest,
  AssetManifestEntry,
  AssetMode,
  ExportWarning
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
