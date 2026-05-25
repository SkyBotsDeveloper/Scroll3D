import { getFrameAssetSource } from "./frame-manifest";
import type { FrameManifest, ReducedMotionConfig } from "./types";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

export function detectPrefersReducedMotion(): boolean {
  const matchMedia = getMatchMedia();

  return matchMedia ? matchMedia(reducedMotionQuery).matches : false;
}

export function shouldUseReducedMotion(config: ReducedMotionConfig): boolean {
  if (config.mode === "disabled") {
    return false;
  }

  if (!config.respectUserPreference) {
    return true;
  }

  return detectPrefersReducedMotion();
}

export function resolveReducedMotionFrameSource(
  config: ReducedMotionConfig,
  manifest: FrameManifest
): string | undefined {
  return (
    getFrameAssetSource(config.posterFrame) ??
    getFrameAssetSource(manifest.reducedMotionFallback) ??
    getFrameAssetSource(manifest.posterFrame)
  );
}

function getMatchMedia(): ((query: string) => MediaQueryList) | undefined {
  if (typeof globalThis.matchMedia === "function") {
    return globalThis.matchMedia.bind(globalThis);
  }

  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia.bind(window);
  }

  return undefined;
}
