import { sampleProject } from "@scroll3d/core";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { createBrowserZipFromBundle, exportStaticProjectToBundle } from "./browser";

describe("browser exporter entrypoint", () => {
  it("exports a browser-safe ZIP blob from a static bundle", async () => {
    const bundleResult = exportStaticProjectToBundle(sampleProject);

    if (!bundleResult.bundle) {
      throw new Error("Expected sample bundle.");
    }

    const zipResult = await createBrowserZipFromBundle(bundleResult.bundle, {
      filename: "preview.zip"
    });
    const blob = zipResult.blob;

    if (!blob) {
      throw new Error("Expected ZIP blob.");
    }

    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    expect(zipResult.success).toBe(true);
    expect(zipResult.blob).toBeInstanceOf(Blob);
    expect(zip.file("index.html")).toBeTruthy();
  });
});
