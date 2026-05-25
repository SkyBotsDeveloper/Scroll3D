import { describe, expect, it } from "vitest";
import {
  createZipDownloadBlob,
  normalizeDownloadFilename,
  zipMimeType
} from "./download";

describe("download helpers", () => {
  it("normalizes ZIP filenames", () => {
    expect(normalizeDownloadFilename("../Unsafe Name")).toBe("Unsafe-Name.zip");
    expect(normalizeDownloadFilename("scroll3d-export.zip")).toBe(
      "scroll3d-export.zip"
    );
  });

  it("wraps blobs with the ZIP MIME type", async () => {
    const source = new Blob(["zip"], { type: "text/plain" });
    const zipBlob = createZipDownloadBlob(source);

    expect(zipBlob.type).toBe(zipMimeType);
    await expect(zipBlob.text()).resolves.toBe("zip");
  });
});
