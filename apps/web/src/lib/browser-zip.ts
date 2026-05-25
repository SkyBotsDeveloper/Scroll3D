import type { Scroll3DProject } from "@scroll3d/core";
import { createBrowserZipFromBundle } from "@scroll3d/exporter/browser";
import { exportProjectToBundle } from "./export-client";

export interface BrowserZipDownload {
  filename: string;
  blob: Blob;
  bytes: number;
}

export async function createProjectZipBlob(
  project: Scroll3DProject,
  filename = "scroll3d-export.zip"
): Promise<BrowserZipDownload> {
  const bundleResult = exportProjectToBundle(project);

  if (!bundleResult.success || !bundleResult.bundle) {
    throw new Error(
      bundleResult.errors[0]?.message ?? "Static export failed before ZIP creation."
    );
  }

  const zipResult = await createBrowserZipFromBundle(bundleResult.bundle, {
    filename,
    includeDirectoryRoot: false
  });

  if (!zipResult.success || !zipResult.blob) {
    throw new Error(zipResult.errors[0]?.message ?? "ZIP export failed.");
  }

  return {
    filename: zipResult.filename,
    blob: zipResult.blob,
    bytes: zipResult.bytes
  };
}
