import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import { generateHtml } from "./html";
import { getDefaultTestConfig } from "./test-utils";

describe("HTML generation", () => {
  it("contains expected sections, canvas, script, and noscript", () => {
    const html = generateHtml(sampleProject, getDefaultTestConfig());

    expect(html).toContain("scroll3d-canvas");
    expect(html).toContain('src="scroll-engine.js"');
    expect(html).toContain("<noscript>");
    expect(html).toContain("section_hero");
    expect(html).toContain("section_features");
  });

  it("escapes unsafe section text", () => {
    const page = sampleProject.pages[0];
    const section = page?.sections[0];

    if (!page || !section) {
      throw new Error("Expected sample project page and section.");
    }

    const html = generateHtml(
      {
        ...sampleProject,
        pages: [
          {
            ...page,
            sections: [
              {
                ...section,
                content: {
                  headline: `<img src=x onerror=alert("x")>`
                }
              }
            ]
          }
        ]
      },
      getDefaultTestConfig()
    );

    expect(html).toContain("&lt;img");
    expect(html).not.toContain("<img src=x");
  });

  it("does not include provider secrets", () => {
    const provider = sampleProject.providers[0];

    if (!provider) {
      throw new Error("Expected sample provider.");
    }

    const html = generateHtml(
      {
        ...sampleProject,
        providers: [
          {
            ...provider,
            config: {
              apiKey: "sk-secret-value"
            }
          }
        ]
      },
      getDefaultTestConfig()
    );

    expect(html).not.toContain("sk-secret-value");
  });
});
