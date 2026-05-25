import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import {
  getEditableContentFields,
  getOrderedSections,
  getVisibleSectionCount,
  isCtaLikeKey,
  parseContentFieldValue
} from "./section-utils";
import { setSectionVisibility } from "./project-updates";

describe("section utilities", () => {
  it("returns sections ordered by order", () => {
    expect(getOrderedSections(sampleProject).map((section) => section.id)).toEqual([
      "section_hero",
      "section_features",
      "section_pricing",
      "section_faq"
    ]);
  });

  it("detects CTA-like content keys", () => {
    expect(isCtaLikeKey("primaryAction")).toBe(true);
    expect(isCtaLikeKey("buttonLabel")).toBe(true);
    expect(isCtaLikeKey("headline")).toBe(false);
  });

  it("extracts editable content fields", () => {
    const hero = sampleProject.pages[0]?.sections[0];

    if (!hero) {
      throw new Error("Expected hero section.");
    }

    expect(getEditableContentFields(hero).map((field) => field.key)).toContain(
      "headline"
    );
  });

  it("parses content field values based on previous primitive type", () => {
    expect(parseContentFieldValue(10, "42")).toBe(42);
    expect(parseContentFieldValue(true, "false")).toBe(false);
    expect(parseContentFieldValue("old", "new")).toBe("new");
  });

  it("counts visible sections", () => {
    const hidden = setSectionVisibility(sampleProject, "section_faq", false);

    expect(getVisibleSectionCount(hidden)).toBe(3);
  });
});
