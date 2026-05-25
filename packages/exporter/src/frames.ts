import type { Scroll3DProject } from "@scroll3d/core";
import { createExportWarning } from "./errors";
import { sanitizeReferencePath } from "./sanitize";
import type {
  CopyPlan,
  CopyPlanEntry,
  ExportWarning,
  FrameMode,
  StaticExportBundle
} from "./types";

export function createFrameCopyPlan(
  project: Scroll3DProject,
  bundle: StaticExportBundle,
  options: { frameMode?: FrameMode } = {}
): CopyPlan {
  const mode = options.frameMode ?? "reference";
  const warnings: ExportWarning[] = [];
  const entries = project.scene.frameSets.flatMap((frameSet) => {
    const frameEntry = createFrameSetCopyPlanEntry(
      frameSet.basePath,
      `frames/${sanitizePathPart(frameSet.target)}`,
      mode,
      warnings,
      frameSet.id
    );
    const manifestEntry = frameSet.manifestPath
      ? createFrameManifestCopyPlanEntry(
          frameSet.manifestPath,
          `frames/${sanitizePathPart(frameSet.target)}/manifest.json`,
          warnings,
          frameSet.id
        )
      : undefined;

    return manifestEntry ? [frameEntry, manifestEntry] : [frameEntry];
  });

  return {
    id: `frame-copy-plan-${bundle.id}`,
    entries,
    warnings,
    createdAt: new Date().toISOString()
  };
}

function createFrameSetCopyPlanEntry(
  sourcePath: string,
  destinationPath: string,
  mode: FrameMode,
  warnings: ExportWarning[],
  frameSetId: string
): CopyPlanEntry {
  const safeSource = sanitizeReferencePath(sourcePath);

  if (!safeSource) {
    warnings.push(
      createExportWarning(
        "frame-copy-skipped",
        `Frame set '${frameSetId}' references an unsafe or local absolute path and will not be copied.`,
        "warning",
        frameSetId
      )
    );

    return {
      sourcePath,
      destinationPath,
      kind: "frame",
      required: false,
      action: "skip"
    };
  }

  if (mode === "manifest-only" || isRemoteReference(safeSource)) {
    return {
      sourcePath: safeSource,
      destinationPath: safeSource,
      kind: "frame",
      required: false,
      action: "reference"
    };
  }

  return {
    sourcePath: safeSource,
    destinationPath,
    kind: "frame",
    required: false,
    action: "reference"
  };
}

function createFrameManifestCopyPlanEntry(
  sourcePath: string,
  destinationPath: string,
  warnings: ExportWarning[],
  frameSetId: string
): CopyPlanEntry {
  const safeSource = sanitizeReferencePath(sourcePath);

  if (!safeSource) {
    warnings.push(
      createExportWarning(
        "frame-manifest-copy-skipped",
        `Frame manifest for '${frameSetId}' references an unsafe path and will not be copied.`,
        "warning",
        frameSetId
      )
    );

    return {
      sourcePath,
      destinationPath,
      kind: "manifest",
      required: false,
      action: "skip"
    };
  }

  return {
    sourcePath: safeSource,
    destinationPath: safeSource,
    kind: "manifest",
    required: false,
    action: "reference"
  };
}

function sanitizePathPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-") || "frames";
}

function isRemoteReference(path: string): boolean {
  return /^(?:https?:)?\/\//i.test(path);
}
