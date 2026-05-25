import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import { generateCss } from "./css";
import { getDefaultTestConfig } from "./test-utils";

describe("CSS generation", () => {
  it("generates theme variables and layout CSS", () => {
    const css = generateCss(sampleProject, getDefaultTestConfig().css, false);

    expect(css).toContain("--scroll3d-color-background:#08090d");
    expect(css).toContain(".scroll3d-canvas");
    expect(css).toContain("@media (max-width:767px)");
    expect(css).toContain("prefers-reduced-motion");
  });

  it("ignores unsafe CSS values", () => {
    const css = generateCss(
      {
        ...sampleProject,
        theme: {
          ...sampleProject.theme,
          colors: {
            ...sampleProject.theme.colors,
            bad: "red;background:url(https://example.invalid/x)"
          }
        }
      },
      getDefaultTestConfig().css,
      false
    );

    expect(css).not.toContain("background:url");
    expect(css).not.toContain("--scroll3d-color-bad");
  });
});
