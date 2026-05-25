import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import {
  createFilePreview,
  createPreviewSrcDoc,
  exportProjectToBundle,
  getBundleFile
} from "./export-client";

describe("export client helpers", () => {
  it("exports the sample project into a static bundle", () => {
    const result = exportProjectToBundle(sampleProject);

    expect(result.success).toBe(true);
    expect(result.bundle?.files.map((file) => file.path)).toContain("index.html");
  });

  it("creates a sandbox-friendly iframe document", () => {
    const bundle = getSampleBundle();
    const srcDoc = createPreviewSrcDoc(bundle);

    expect(srcDoc).toContain("<style>");
    expect(srcDoc).not.toContain('src="scroll-engine.js"');
    expect(srcDoc).toContain("generated scripts are disabled");
  });

  it("creates text previews for generated files", () => {
    const bundle = getSampleBundle();
    const file = getBundleFile(bundle, "project.json");
    const preview = createFilePreview(file, 120);

    expect(preview?.supported).toBe(true);
    expect(preview?.text).toContain("project_saas_cinematic");
    expect(preview?.truncated).toBe(true);
  });
});

function getSampleBundle() {
  const result = exportProjectToBundle(sampleProject);

  if (!result.bundle) {
    throw new Error("Expected static export bundle.");
  }

  return result.bundle;
}
