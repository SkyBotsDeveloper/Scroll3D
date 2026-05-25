import type { Scroll3DProject, Section } from "@scroll3d/core";
import type {
  FrameAssetRef,
  FrameManifest,
  FrameSet,
  TimelineSegment
} from "@scroll3d/scroll-engine";
import { safeJsonStringify, sanitizeReferencePath } from "./sanitize";

export function createFrameManifest(project: Scroll3DProject): FrameManifest {
  const frameSets = project.scene.frameSets.map((frameSet) => {
    const format = frameSet.format === "jpg" ? "jpg" : frameSet.format;
    const exportedFrameSet: FrameSet = {
      id: frameSet.id,
      target: frameSet.target,
      frameCount: frameSet.frameCount,
      format,
      width: frameSet.width,
      height: frameSet.height,
      basePath: sanitizeReferencePath(frameSet.basePath) ?? "",
      filenamePattern: `frame_{index:0001}.${format}`,
      manifestPath:
        sanitizeReferencePath(frameSet.manifestPath) ?? frameSet.manifestPath,
      metadata: {
        sourceManifestPath: frameSet.manifestPath
      }
    };

    return exportedFrameSet;
  });
  const posterFrame = createPosterFrame(project);

  return {
    id: `${project.scene.id}-frame-manifest`,
    name: project.scene.name,
    version: project.version,
    frameSets,
    defaultTarget: frameSets.find((frameSet) => frameSet.target === "desktop")
      ? "desktop"
      : (frameSets[0]?.target ?? "desktop"),
    ...(posterFrame ? { posterFrame, reducedMotionFallback: posterFrame } : {}),
    metadata: {
      projectId: project.id,
      playbackMode: project.scene.playbackMode,
      scrollLength: project.scene.scrollLength,
      timeline: createTimelineSegments(project)
    }
  };
}

export function generateFrameManifestJson(project: Scroll3DProject): string {
  return safeJsonStringify(createFrameManifest(project));
}

export function createTimelineSegments(project: Scroll3DProject): TimelineSegment[] {
  const sections = project.pages[0]
    ? [...project.pages[0].sections].sort((left, right) => left.order - right.order)
    : undefined;

  if (!sections || sections.length === 0) {
    return [];
  }

  return sections.map((section, index) =>
    createTimelineSegment(section, index, sections.length, project.scene.scrollLength)
  );
}

function createTimelineSegment(
  section: Section,
  index: number,
  sectionCount: number,
  scrollLength: number
): TimelineSegment {
  const sceneRange = getSceneRange(section);

  if (sceneRange) {
    return {
      id: section.id,
      start: clampProgress(sceneRange[0] / scrollLength),
      end: clampProgress(sceneRange[1] / scrollLength),
      label: section.name,
      metadata: {
        sectionType: section.type
      }
    };
  }

  return {
    id: section.id,
    start: index / sectionCount,
    end: (index + 1) / sectionCount,
    label: section.name,
    metadata: {
      sectionType: section.type
    }
  };
}

function getSceneRange(section: Section): [number, number] | null {
  const sceneRange = section.settings.sceneRange;

  if (
    Array.isArray(sceneRange) &&
    sceneRange.length >= 2 &&
    typeof sceneRange[0] === "number" &&
    typeof sceneRange[1] === "number" &&
    sceneRange[1] > sceneRange[0]
  ) {
    return [sceneRange[0], sceneRange[1]];
  }

  return null;
}

function createPosterFrame(project: Scroll3DProject): FrameAssetRef | undefined {
  const fallback = project.scene.reducedMotionFallback;

  if (fallback.type === "image") {
    const src = sanitizeReferencePath(fallback.src);

    if (!src) {
      return undefined;
    }

    return {
      src,
      ...(fallback.alt ? { alt: fallback.alt } : {})
    };
  }

  const firstImage = project.assets.find((asset) => asset.type === "image");
  const src = firstImage ? sanitizeReferencePath(firstImage.src) : null;

  if (!firstImage || !src) {
    return undefined;
  }

  return {
    src,
    ...(firstImage.alt ? { alt: firstImage.alt } : {})
  };
}

function clampProgress(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
