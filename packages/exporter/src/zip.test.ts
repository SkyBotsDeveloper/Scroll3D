import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { sampleProject } from "@scroll3d/core";
import JSZip from "jszip";
import { afterEach, describe, expect, it } from "vitest";
import { exportStaticProjectToBundle, exportStaticProjectToZip } from "./exporter";
import { createZipFromBundle, writeZipFromBundle } from "./zip";
import type { StaticExportBundle } from "./types";

const tempDirs: string[] = [];

describe("zip exporter", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs.map((tempDir) => rm(tempDir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  it("generates a ZIP buffer with expected files", async () => {
    const result = await createZipFromBundle(getSampleBundle(), {
      filename: "site.zip"
    });
    const zip = await JSZip.loadAsync(getZipBuffer(result));

    expect(result.success).toBe(true);
    expect(result.bytes).toBeGreaterThan(0);
    expect(zip.file("index.html")).toBeTruthy();
    expect(zip.file("styles.css")).toBeTruthy();
    expect(zip.file("scroll-engine.js")).toBeTruthy();
    expect(zip.file("project.json")).toBeTruthy();
    expect(zip.file("frame-manifest.json")).toBeTruthy();
    expect(zip.file("README.md")).toBeTruthy();
  });

  it("supports an optional root directory", async () => {
    const result = await createZipFromBundle(getSampleBundle(), {
      filename: "site.zip",
      includeDirectoryRoot: true,
      rootDirectoryName: "scroll3d-site"
    });
    const zip = await JSZip.loadAsync(getZipBuffer(result));

    expect(zip.file("scroll3d-site/index.html")).toBeTruthy();
  });

  it("does not include raw secrets in ZIP files", async () => {
    const provider = sampleProject.providers[0];

    if (!provider) {
      throw new Error("Expected sample provider.");
    }

    const result = await exportStaticProjectToZip(
      {
        ...sampleProject,
        providers: [
          {
            ...provider,
            config: {
              apiKey: "sk-very-secret-value"
            }
          }
        ]
      },
      {},
      { filename: "safe.zip" }
    );
    const zip = await JSZip.loadAsync(getZipBuffer(result));
    const contents = await Promise.all(
      Object.values(zip.files)
        .filter((file) => !file.dir)
        .map((file) => file.async("string"))
    );
    const serialized = contents.join("\n");

    expect(result.success).toBe(true);
    expect(serialized).not.toContain("sk-very-secret-value");
    expect(serialized).not.toContain("apiKey");
  });

  it("writes a ZIP file to disk when outputPath is provided", async () => {
    const tempDir = await createTempDir();
    const outputPath = path.join(tempDir, "export.zip");
    const result = await writeZipFromBundle(getSampleBundle(), {
      filename: "export.zip",
      outputPath
    });

    expect(result.success).toBe(true);
    expect(result.outputPath).toBe(path.resolve(outputPath));
    await expect(stat(outputPath)).resolves.toMatchObject({ size: result.bytes });
    await expect(readFile(outputPath)).resolves.toHaveLength(result.bytes);
  });
});

function getSampleBundle(): StaticExportBundle {
  const result = exportStaticProjectToBundle(sampleProject);

  if (!result.success || !result.bundle) {
    throw new Error("Expected sample export bundle.");
  }

  return result.bundle;
}

function getZipBuffer(result: { buffer?: Buffer }): Buffer {
  if (!result.buffer) {
    throw new Error("Expected ZIP buffer.");
  }

  return result.buffer;
}

async function createTempDir(): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "scroll3d-zip-"));
  tempDirs.push(tempDir);

  return tempDir;
}
