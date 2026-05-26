import { describe, expect, it } from "vitest";
import {
  cinematicGenerationPhases,
  getCinematicGenerationPhase,
  getCompletedGenerationPhases,
  getPreviewDeviceWidth,
  sceneTimelineItems
} from "./cinematic-generation";

describe("cinematic generation helpers", () => {
  it("keeps generation phases ordered from brief to final", () => {
    expect(cinematicGenerationPhases.map((phase) => phase.id)).toEqual([
      "brief",
      "structure",
      "content",
      "motion",
      "final"
    ]);
    expect(cinematicGenerationPhases.at(-1)?.progress).toBe(100);
  });

  it("clamps the active phase lookup", () => {
    expect(getCinematicGenerationPhase(-4).id).toBe("brief");
    expect(getCinematicGenerationPhase(999).id).toBe("final");
  });

  it("reports completed phases differently while generating and after completion", () => {
    expect(getCompletedGenerationPhases(2, true)).toEqual(["brief", "structure"]);
    expect(getCompletedGenerationPhases(2, false)).toEqual([
      "brief",
      "structure",
      "content"
    ]);
  });

  it("maps preview devices to stable viewport widths", () => {
    expect(getPreviewDeviceWidth("desktop")).toBe("100%");
    expect(getPreviewDeviceWidth("tablet")).toBe("820px");
    expect(getPreviewDeviceWidth("mobile")).toBe("390px");
  });

  it("defines ordered scene timeline items", () => {
    expect(sceneTimelineItems.map((item) => item.order)).toEqual([1, 2, 3, 4]);
    expect(sceneTimelineItems.every((item) => item.transitionHint.length > 0)).toBe(
      true
    );
  });
});
