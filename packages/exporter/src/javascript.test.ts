import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import { generateJavaScript } from "./javascript";
import { getDefaultTestConfig } from "./test-utils";

describe("JavaScript generation", () => {
  it("contains initialization and frame manifest reference", () => {
    const js = generateJavaScript(
      sampleProject,
      getDefaultTestConfig().javascript,
      false
    );

    expect(js).toContain("startScroll3DExport");
    expect(js).toContain("frame-manifest.json");
    expect(js).toContain("prefers-reduced-motion");
  });

  it("does not include eval, new Function, or secrets", () => {
    const provider = sampleProject.providers[0];

    if (!provider) {
      throw new Error("Expected sample provider.");
    }

    const js = generateJavaScript(
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
      getDefaultTestConfig().javascript,
      false
    );

    expect(js).not.toContain("eval(");
    expect(js).not.toContain("new Function");
    expect(js).not.toContain("sk-secret-value");
  });
});
