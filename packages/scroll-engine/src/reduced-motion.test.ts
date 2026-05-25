import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleFrameManifest } from "./fixtures/sample-manifest";
import {
  detectPrefersReducedMotion,
  resolveReducedMotionFrameSource,
  shouldUseReducedMotion
} from "./index";

describe("reduced motion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects prefers-reduced-motion when matchMedia is available", () => {
    vi.stubGlobal("matchMedia", createMatchMedia(true));

    expect(detectPrefersReducedMotion()).toBe(true);
  });

  it("respects user preference when configured", () => {
    vi.stubGlobal("matchMedia", createMatchMedia(false));

    expect(
      shouldUseReducedMotion({
        respectUserPreference: true,
        mode: "poster"
      })
    ).toBe(false);
  });

  it("allows config override", () => {
    expect(
      shouldUseReducedMotion({
        respectUserPreference: false,
        mode: "first-frame"
      })
    ).toBe(true);
    expect(
      shouldUseReducedMotion({
        respectUserPreference: false,
        mode: "disabled"
      })
    ).toBe(false);
  });

  it("resolves poster fallback sources", () => {
    expect(
      resolveReducedMotionFrameSource(
        {
          respectUserPreference: false,
          mode: "poster",
          posterFrame: "/custom-poster.webp"
        },
        sampleFrameManifest
      )
    ).toBe("/custom-poster.webp");
    expect(
      resolveReducedMotionFrameSource(
        {
          respectUserPreference: false,
          mode: "poster"
        },
        sampleFrameManifest
      )
    ).toBe("/sample-frames/reduced-motion.webp");
  });
});

function createMatchMedia(matches: boolean): (query: string) => MediaQueryList {
  return (query: string) => {
    const mediaQueryList: MediaQueryList = {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true)
    };

    return mediaQueryList;
  };
}
