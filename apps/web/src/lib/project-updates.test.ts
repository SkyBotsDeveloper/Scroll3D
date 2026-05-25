import { sampleProject, validateProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import {
  createExportProject,
  moveSection,
  setSectionVisibility,
  updatePlaybackMode,
  updateProjectMode,
  updateProjectName,
  updateScrollLength,
  updateSectionContent,
  updateSectionName,
  updateThemeColor,
  updateThemeEffect,
  updateThemeRadius,
  updateThemeTypography
} from "./project-updates";

describe("project update helpers", () => {
  it("updates project basics without mutating the original project", () => {
    const updated = updateProjectName(sampleProject, "Edited launch");
    const modeUpdated = updateProjectMode(updated, "local");

    expect(updated.name).toBe("Edited launch");
    expect(modeUpdated.mode).toBe("local");
    expect(sampleProject.name).toBe("Cinematic SaaS Launch");
    expect(validateProject(modeUpdated)).toBe(true);
  });

  it("updates theme values", () => {
    const withColor = updateThemeColor(sampleProject, "primary", "#ffffff");
    const withTypography = updateThemeTypography(
      withColor,
      "fontFamily",
      "Inter, system-ui"
    );
    const withRadius = updateThemeRadius(withTypography, "md", "6px");
    const withEffect = updateThemeEffect(withRadius, "depthFog", false);

    expect(withEffect.theme.colors.primary).toBe("#ffffff");
    expect(withEffect.theme.typography.fontFamily).toBe("Inter, system-ui");
    expect(withEffect.theme.radius.md).toBe("6px");
    expect(withEffect.theme.effects.depthFog).toBe(false);
    expect(sampleProject.theme.colors.primary).toBe("#42d6a4");
    expect(validateProject(withEffect)).toBe(true);
  });

  it("updates section name and content while preserving other content", () => {
    const updatedName = updateSectionName(sampleProject, "section_hero", "Opening");
    const updatedContent = updateSectionContent(
      updatedName,
      "section_hero",
      "headline",
      "A better headline"
    );
    const hero = updatedContent.pages[0]?.sections.find(
      (section) => section.id === "section_hero"
    );

    expect(hero?.name).toBe("Opening");
    expect(hero?.content.headline).toBe("A better headline");
    expect(hero?.content.subheadline).toBeDefined();
    expect(validateProject(updatedContent)).toBe(true);
  });

  it("reorders sections", () => {
    const updated = moveSection(sampleProject, "section_features", "up");
    const orderedIds = updated.pages[0]?.sections
      .sort((left, right) => left.order - right.order)
      .map((section) => section.id);

    expect(orderedIds?.slice(0, 2)).toEqual(["section_features", "section_hero"]);
    expect(validateProject(updated)).toBe(true);
  });

  it("stores UI-level visibility and filters export sections", () => {
    const hidden = setSectionVisibility(sampleProject, "section_pricing", false);
    const exportProject = createExportProject(hidden);

    expect(
      hidden.pages[0]?.sections.find((section) => section.id === "section_pricing")
        ?.settings.visible
    ).toBe(false);
    expect(
      exportProject.pages[0]?.sections.some(
        (section) => section.id === "section_pricing"
      )
    ).toBe(false);
    expect(validateProject(hidden)).toBe(true);
    expect(validateProject(exportProject)).toBe(true);
  });

  it("updates scroll scene settings", () => {
    const updated = updatePlaybackMode(
      updateScrollLength(sampleProject, 7200),
      "scrub"
    );

    expect(updated.scene.scrollLength).toBe(7200);
    expect(updated.scene.playbackMode).toBe("scrub");
    expect(validateProject(updated)).toBe(true);
  });
});
