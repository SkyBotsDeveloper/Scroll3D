import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import { createProjectZipBlob } from "./browser-zip";

describe("browser ZIP helper", () => {
  it("creates a ZIP Blob for the sample project", async () => {
    const result = await createProjectZipBlob(sampleProject, "scroll3d-preview");

    expect(result.filename).toBe("scroll3d-preview.zip");
    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.bytes).toBeGreaterThan(0);
  });
});
