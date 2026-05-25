import type {
  FitRect,
  FrameManifest,
  FrameSet,
  FrameTarget,
  TimelineSegment
} from "./types";

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export function normalizeProgress(scrollTop: number, maxScroll: number): number {
  if (maxScroll <= 0) {
    return 0;
  }

  return clamp(scrollTop / maxScroll, 0, 1);
}

export function progressToFrameIndex(progress: number, frameCount: number): number {
  if (frameCount <= 1) {
    return 0;
  }

  return clamp(Math.round(clamp(progress, 0, 1) * (frameCount - 1)), 0, frameCount - 1);
}

export function frameIndexToProgress(frameIndex: number, frameCount: number): number {
  if (frameCount <= 1) {
    return 0;
  }

  return clamp(frameIndex, 0, frameCount - 1) / (frameCount - 1);
}

export function resolveFrameUrl(frameSet: FrameSet, frameIndex: number): string {
  const safeFrameIndex = progressToFrameIndex(
    frameIndexToProgress(frameIndex, frameSet.frameCount),
    frameSet.frameCount
  );
  const fileName = frameSet.filenamePattern.replaceAll(
    /\{index(?::([0-9]+))?\}/g,
    (_placeholder, pattern: string | undefined) => {
      if (!pattern) {
        return String(safeFrameIndex);
      }

      const startIndex = Number.parseInt(pattern, 10);
      const resolvedIndex =
        safeFrameIndex + (Number.isNaN(startIndex) ? 0 : startIndex);

      return String(resolvedIndex).padStart(pattern.length, "0");
    }
  );
  const basePath = frameSet.basePath.replace(/\/+$/, "");

  return basePath.length > 0 ? `${basePath}/${fileName}` : fileName;
}

export function calculateCoverFit(
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number
): FitRect {
  return calculateFit("cover", canvasWidth, canvasHeight, imageWidth, imageHeight);
}

export function calculateContainFit(
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number
): FitRect {
  return calculateFit("contain", canvasWidth, canvasHeight, imageWidth, imageHeight);
}

export function selectFrameSet(manifest: FrameManifest, target: FrameTarget): FrameSet {
  const exactFrameSet = manifest.frameSets.find(
    (frameSet) => frameSet.target === target
  );

  if (exactFrameSet) {
    return exactFrameSet;
  }

  const defaultFrameSet = manifest.frameSets.find(
    (frameSet) => frameSet.target === manifest.defaultTarget
  );

  if (defaultFrameSet) {
    return defaultFrameSet;
  }

  const firstFrameSet = manifest.frameSets[0];

  if (!firstFrameSet) {
    throw new Error(`Frame manifest '${manifest.id}' does not contain frame sets.`);
  }

  return firstFrameSet;
}

export function getTimelineSegment(
  progress: number,
  segments: readonly TimelineSegment[] = []
): TimelineSegment | undefined {
  const safeProgress = clamp(progress, 0, 1);
  const sortedSegments = [...segments].sort((left, right) => left.start - right.start);

  return sortedSegments.find((segment, index) => {
    const start = clamp(segment.start, 0, 1);
    const end = clamp(segment.end, 0, 1);
    const isLastSegment = index === sortedSegments.length - 1;

    return (
      safeProgress >= start &&
      (safeProgress < end || (isLastSegment && safeProgress <= end))
    );
  });
}

function calculateFit(
  mode: "cover" | "contain",
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number
): FitRect {
  if (canvasWidth <= 0 || canvasHeight <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  }

  const scale =
    mode === "cover"
      ? Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight)
      : Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    x: (canvasWidth - width) / 2,
    y: (canvasHeight - height) / 2,
    width,
    height
  };
}
