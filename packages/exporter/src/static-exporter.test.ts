import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import { exportStaticProject } from "./index";

describe("static exporter", () => {
  it("exports the sample project with expected files", () => {
    const result = exportStaticProject(sampleProject);

    expect(result.success).toBe(true);
    expect(result.bundle?.files.map((file) => file.path).sort()).toEqual([
      "README.md",
      "assets/manifest.json",
      "frame-manifest.json",
      "index.html",
      "project.json",
      "scroll-engine.js",
      "styles.css"
    ]);
  });

  it("does not expose secrets in the export bundle", () => {
    const provider = sampleProject.providers[0];

    if (!provider) {
      throw new Error("Expected sample provider.");
    }

    const result = exportStaticProject({
      ...sampleProject,
      providers: [
        {
          ...provider,
          config: {
            apiKey: "sk-secret-value"
          }
        }
      ]
    });
    const serialized = JSON.stringify(result.bundle);

    expect(result.success).toBe(true);
    expect(serialized).not.toContain("sk-secret-value");
    expect(serialized).not.toContain("apiKey");
  });

  it("returns errors for invalid projects", () => {
    const result = exportStaticProject({ id: "invalid" });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.severity).toBe("error");
  });
});
