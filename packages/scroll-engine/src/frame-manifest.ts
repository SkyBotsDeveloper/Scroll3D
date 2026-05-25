import { selectFrameSet } from "./frame-math";
import type { FrameAssetRef, FrameManifest, FrameSet, FrameTarget } from "./types";

export function validateFrameSet(frameSet: FrameSet): FrameSet {
  if (frameSet.frameCount <= 0) {
    throw new Error(`Frame set '${frameSet.id}' must contain at least one frame.`);
  }

  if (frameSet.width <= 0 || frameSet.height <= 0) {
    throw new Error(`Frame set '${frameSet.id}' must define positive dimensions.`);
  }

  if (!frameSet.filenamePattern.includes("{index")) {
    throw new Error(
      `Frame set '${frameSet.id}' filenamePattern must include an index placeholder.`
    );
  }

  return frameSet;
}

export function validateFrameManifest(manifest: FrameManifest): FrameManifest {
  if (manifest.frameSets.length === 0) {
    throw new Error(`Frame manifest '${manifest.id}' must include frame sets.`);
  }

  manifest.frameSets.forEach(validateFrameSet);
  selectFrameSet(manifest, manifest.defaultTarget);

  return manifest;
}

export function getFrameSetOrThrow(
  manifest: FrameManifest,
  target: FrameTarget
): FrameSet {
  return selectFrameSet(validateFrameManifest(manifest), target);
}

export function getFrameAssetSource(
  asset: string | FrameAssetRef | undefined
): string | undefined {
  if (!asset) {
    return undefined;
  }

  return typeof asset === "string" ? asset : asset.src;
}
