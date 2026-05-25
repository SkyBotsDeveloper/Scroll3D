import { describe, expect, it } from "vitest";
import {
  sampleFrameManifest,
  sampleTimelineSegments
} from "./fixtures/sample-manifest";
import {
  calculateContainFit,
  calculateCoverFit,
  clamp,
  frameIndexToProgress,
  getTimelineSegment,
  normalizeProgress,
  progressToFrameIndex,
  resolveFrameUrl,
  selectFrameSet
} from "./index";

describe("frame math", () => {
  it("clamps values and normalized scroll progress", () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
    expect(normalizeProgress(50, 100)).toBe(0.5);
    expect(normalizeProgress(200, 100)).toBe(1);
    expect(normalizeProgress(50, 0)).toBe(0);
  });

  it("maps progress to deterministic frame indices", () => {
    expect(progressToFrameIndex(-1, 10)).toBe(0);
    expect(progressToFrameIndex(0, 10)).toBe(0);
    expect(progressToFrameIndex(0.5, 10)).toBe(5);
    expect(progressToFrameIndex(1, 10)).toBe(9);
    expect(progressToFrameIndex(1.5, 10)).toBe(9);
    expect(progressToFrameIndex(0.8, 1)).toBe(0);
  });

  it("maps frame indices back to progress", () => {
    expect(frameIndexToProgress(0, 10)).toBe(0);
    expect(frameIndexToProgress(9, 10)).toBe(1);
    expect(frameIndexToProgress(99, 10)).toBe(1);
    expect(frameIndexToProgress(0, 1)).toBe(0);
  });

  it("resolves frame URLs with supported index placeholders", () => {
    const desktop = selectFrameSet(sampleFrameManifest, "desktop");

    expect(resolveFrameUrl(desktop, 0)).toBe("/sample-frames/desktop/frame_0001.webp");
    expect(resolveFrameUrl(desktop, 11)).toBe("/sample-frames/desktop/frame_0012.webp");
    expect(
      resolveFrameUrl(
        { ...desktop, basePath: "", filenamePattern: "frame-{index:0000}.webp" },
        11
      )
    ).toBe("frame-0011.webp");
    expect(
      resolveFrameUrl({ ...desktop, filenamePattern: "frame-{index}.webp" }, 11)
    ).toBe("/sample-frames/desktop/frame-11.webp");
  });

  it("calculates cover and contain fit rectangles", () => {
    expect(calculateCoverFit(100, 100, 200, 100)).toEqual({
      x: -50,
      y: 0,
      width: 200,
      height: 100
    });
    expect(calculateContainFit(100, 100, 200, 100)).toEqual({
      x: 0,
      y: 25,
      width: 100,
      height: 50
    });
  });

  it("selects frame sets with default fallback", () => {
    expect(selectFrameSet(sampleFrameManifest, "desktop").id).toBe("sample-desktop");
    expect(selectFrameSet(sampleFrameManifest, "tablet").id).toBe("sample-desktop");
  });

  it("selects the active timeline segment", () => {
    expect(getTimelineSegment(0.1, sampleTimelineSegments)?.id).toBe("intro");
    expect(getTimelineSegment(0.32, sampleTimelineSegments)?.id).toBe("feature-orbit");
    expect(getTimelineSegment(1, sampleTimelineSegments)?.id).toBe("conversion");
  });
});
