import { selectFrameSet } from "./frame-math";
import type { FrameManifest, FrameSet, FrameTarget, ResponsiveConfig } from "./types";

export const DEFAULT_MOBILE_MAX_WIDTH = 767;
export const DEFAULT_TABLET_MAX_WIDTH = 1023;

export function inferFrameTarget(
  viewportWidth: number,
  config: ResponsiveConfig = { enabled: true }
): FrameTarget {
  const mobileMaxWidth = config.mobileMaxWidth ?? DEFAULT_MOBILE_MAX_WIDTH;
  const tabletMaxWidth = config.tabletMaxWidth ?? DEFAULT_TABLET_MAX_WIDTH;

  if (viewportWidth <= mobileMaxWidth) {
    return "mobile";
  }

  if (viewportWidth <= tabletMaxWidth) {
    return "tablet";
  }

  return "desktop";
}

export function resolveResponsiveTarget(options: {
  manifest: FrameManifest;
  explicitTarget?: FrameTarget;
  viewportWidth?: number;
  responsive: ResponsiveConfig;
}): FrameTarget {
  if (options.explicitTarget) {
    return options.explicitTarget;
  }

  if (!options.responsive.enabled) {
    return options.manifest.defaultTarget;
  }

  return inferFrameTarget(
    options.viewportWidth ?? getCurrentViewportWidth(),
    options.responsive
  );
}

export function selectResponsiveFrameSet(options: {
  manifest: FrameManifest;
  explicitTarget?: FrameTarget;
  viewportWidth?: number;
  responsive: ResponsiveConfig;
}): FrameSet {
  const target = resolveResponsiveTarget(options);

  return selectFrameSet(options.manifest, target);
}

export function getCurrentViewportWidth(): number {
  if (typeof globalThis.window === "undefined") {
    return DEFAULT_TABLET_MAX_WIDTH + 1;
  }

  return globalThis.window.innerWidth;
}
