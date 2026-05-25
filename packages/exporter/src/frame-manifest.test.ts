import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import {
  createFrameManifest,
  createTimelineSegments,
  generateFrameManifestJson
} from "./index";

describe("frame manifest export", () => {
  it("exports desktop and mobile frame sets", () => {
    const manifest = createFrameManifest(sampleProject);

    expect(manifest.frameSets.map((frameSet) => frameSet.target)).toEqual([
      "desktop",
      "mobile"
    ]);
    expect(manifest.frameSets[0]?.filenamePattern).toBe("frame_{index:0001}.webp");
  });

  it("outputs parseable JSON", () => {
    const json = generateFrameManifestJson(sampleProject);
    const manifest = JSON.parse(json) as ReturnType<typeof createFrameManifest>;

    expect(manifest.id).toBe("scene_saas_orbit-frame-manifest");
  });

  it("generates timeline segments", () => {
    const segments = createTimelineSegments(sampleProject);

    expect(segments).toHaveLength(4);
    expect(segments[0]?.id).toBe("section_hero");
  });
});
