export const zipMimeType = "application/zip";

export function normalizeDownloadFilename(filename: string): string {
  const baseName =
    filename.trim().replaceAll("\\", "/").split("/").filter(Boolean).at(-1) ??
    "scroll3d-export.zip";
  const safeName =
    baseName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") ||
    "scroll3d-export.zip";

  return safeName.toLowerCase().endsWith(".zip") ? safeName : `${safeName}.zip`;
}

export function createZipDownloadBlob(blob: Blob): Blob {
  if (blob.type === zipMimeType) {
    return blob;
  }

  return new Blob([blob], { type: zipMimeType });
}

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    throw new Error("Browser download is not available in this environment.");
  }

  const safeFilename = normalizeDownloadFilename(filename);
  const url = URL.createObjectURL(createZipDownloadBlob(blob));
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = safeFilename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
