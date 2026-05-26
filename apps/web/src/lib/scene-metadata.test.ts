import { sampleProject, validateProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import {
  getFirstSceneId,
  getProjectScenes,
  getSceneById,
  getSceneMetadata,
  moveSceneToIndex,
  motionPresets,
  narrativeRoles,
  transitionStyles,
  updateSceneMetadata
} from "./scene-metadata";

describe("scene metadata helpers", () => {
  it("derives scene metadata from project sections", () => {
    const scenes = getProjectScenes(sampleProject);

    expect(scenes.map((scene) => scene.id)).toEqual([
      "section_hero",
      "section_features",
      "section_pricing",
      "section_faq"
    ]);
    expect(scenes[0]?.metadata.narrativeRole).toBe("opening-hook");
    expect(scenes[0]?.metadata.motionPreset).toBe("slow-reveal");
    expect(scenes.every((scene) => scene.metadata.directorNote.length > 0)).toBe(true);
  });

  it("stores scene metadata without mutating the original project", () => {
    const updated = updateSceneMetadata(sampleProject, "section_features", {
      title: "Feature reveal sequence",
      motionPreset: "depth-push",
      transitionStyle: "fade-through",
      narrativeRole: "feature-reveal",
      intensity: "high",
      pacing: "fast",
      durationBeats: 5
    });
    const scene = getSceneById(updated, "section_features");

    expect(scene?.metadata.title).toBe("Feature reveal sequence");
    expect(scene?.metadata.motionPreset).toBe("depth-push");
    expect(scene?.section.name).toBe("Feature reveal sequence");
    expect(getSceneById(sampleProject, "section_features")?.section.name).toBe(
      "Features"
    );
    expect(validateProject(updated)).toBe(true);
  });

  it("reorders scenes by target index", () => {
    const updated = moveSceneToIndex(sampleProject, "section_faq", 1);
    const ids = getProjectScenes(updated).map((scene) => scene.id);

    expect(ids).toEqual([
      "section_hero",
      "section_faq",
      "section_features",
      "section_pricing"
    ]);
    expect(getProjectScenes(updated).map((scene) => scene.section.order)).toEqual([
      0, 1, 2, 3
    ]);
    expect(validateProject(updated)).toBe(true);
  });

  it("falls back safely when stored metadata is invalid", () => {
    const hero = sampleProject.pages[0]?.sections[0];

    if (!hero) {
      throw new Error("Sample project is missing the hero section.");
    }

    const section = {
      ...hero,
      settings: {
        scene: {
          title: "",
          motionPreset: "not-real",
          transitionStyle: "missing",
          narrativeRole: "unknown",
          intensity: "loud",
          pacing: "hyper",
          durationBeats: -10
        }
      }
    };
    const metadata = getSceneMetadata(section, 0);

    expect(metadata.title).toBe(section.name);
    expect(metadata.motionPreset).toBe("slow-reveal");
    expect(metadata.transitionStyle).toBe("soft-cut");
    expect(metadata.narrativeRole).toBe("opening-hook");
    expect(metadata.durationBeats).toBe(2);
  });

  it("defines reusable motion, transition, and narrative vocabularies", () => {
    expect(motionPresets.map((preset) => preset.label)).toContain("Parallax Drift");
    expect(transitionStyles.map((transition) => transition.label)).toContain(
      "Depth Shift"
    );
    expect(narrativeRoles.map((role) => role.label)).toContain("Final CTA Impact");
    expect(getFirstSceneId(sampleProject)).toBe("section_hero");
  });
});
