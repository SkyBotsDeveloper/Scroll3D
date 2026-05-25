import { describe, expect, it } from "vitest";
import { sampleFrameManifest } from "./fixtures/sample-manifest";
import {
  inferFrameTarget,
  resolveResponsiveTarget,
  selectResponsiveFrameSet
} from "./index";

describe("responsive frame selection", () => {
  it("infers targets from viewport width", () => {
    expect(inferFrameTarget(360)).toBe("mobile");
    expect(inferFrameTarget(768)).toBe("tablet");
    expect(inferFrameTarget(1024)).toBe("desktop");
  });

  it("honors explicit target overrides", () => {
    expect(
      resolveResponsiveTarget({
        manifest: sampleFrameManifest,
        explicitTarget: "mobile",
        viewportWidth: 1440,
        responsive: { enabled: true }
      })
    ).toBe("mobile");
  });

  it("uses manifest default when responsive mode is disabled", () => {
    expect(
      resolveResponsiveTarget({
        manifest: sampleFrameManifest,
        viewportWidth: 360,
        responsive: { enabled: false }
      })
    ).toBe("desktop");
  });

  it("selects responsive frame sets with fallback", () => {
    expect(
      selectResponsiveFrameSet({
        manifest: sampleFrameManifest,
        viewportWidth: 360,
        responsive: { enabled: true }
      }).target
    ).toBe("mobile");
    expect(
      selectResponsiveFrameSet({
        manifest: sampleFrameManifest,
        viewportWidth: 900,
        responsive: { enabled: true }
      }).target
    ).toBe("desktop");
  });
});
