import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { sampleProject } from "@scroll3d/core";
import { afterEach, describe, expect, it } from "vitest";
import { exportStaticProjectToBundle } from "./exporter";
import { writeStaticExportBundle } from "./disk";
import type { StaticExportBundle } from "./types";

const tempDirs: string[] = [];

describe("disk exporter", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs.map((tempDir) => rm(tempDir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  it("writes a static export bundle to a temporary directory", async () => {
    const bundle = getSampleBundle();
    const outputDir = await createTempDir();
    const result = await writeStaticExportBundle(bundle, {
      outputDir,
      cleanOutputDir: false,
      overwrite: true,
      dryRun: false,
      preserveExisting: false,
      includeDotfiles: false
    });

    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(bundle.files.length);
    await expect(
      readFile(path.join(outputDir, "index.html"), "utf8")
    ).resolves.toContain("Cinematic SaaS Launch");
  });

  it("supports dry run without writing files", async () => {
    const outputDir = path.join(await createTempDir(), "dry-run-export");
    const result = await writeStaticExportBundle(getSampleBundle(), {
      outputDir,
      cleanOutputDir: false,
      overwrite: true,
      dryRun: true,
      preserveExisting: false,
      includeDotfiles: false
    });

    expect(result.success).toBe(true);
    expect(result.files.every((file) => file.skipped)).toBe(true);
    await expect(stat(outputDir)).rejects.toThrow();
  });

  it("blocks path traversal in bundle files", async () => {
    const bundle: StaticExportBundle = {
      ...getSampleBundle(),
      files: [
        {
          path: "../outside.txt",
          content: "unsafe",
          encoding: "utf8",
          mimeType: "text/plain"
        }
      ]
    };
    const result = await writeStaticExportBundle(bundle, {
      outputDir: await createTempDir(),
      cleanOutputDir: false,
      overwrite: true,
      dryRun: false,
      preserveExisting: false,
      includeDotfiles: false
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe("disk-export-failed");
  });

  it("skips existing files when overwrite is disabled", async () => {
    const outputDir = await createTempDir();
    const existingPath = path.join(outputDir, "index.html");
    await writeFile(existingPath, "existing", "utf8");

    const result = await writeStaticExportBundle(getSampleBundle(), {
      outputDir,
      cleanOutputDir: false,
      overwrite: false,
      dryRun: false,
      preserveExisting: false,
      includeDotfiles: false
    });

    expect(result.success).toBe(true);
    expect(result.files.find((file) => file.path === existingPath)?.skipped).toBe(true);
    await expect(readFile(existingPath, "utf8")).resolves.toBe("existing");
  });

  it("cleans only the configured output directory", async () => {
    const outputDir = await createTempDir();
    const stalePath = path.join(outputDir, "stale.txt");
    await writeFile(stalePath, "stale", "utf8");

    const result = await writeStaticExportBundle(getSampleBundle(), {
      outputDir,
      cleanOutputDir: true,
      overwrite: true,
      dryRun: false,
      preserveExisting: false,
      includeDotfiles: false
    });

    expect(result.success).toBe(true);
    await expect(stat(stalePath)).rejects.toThrow();
    await expect(
      readFile(path.join(outputDir, "styles.css"), "utf8")
    ).resolves.toContain(":root");
  });
});

function getSampleBundle(): StaticExportBundle {
  const result = exportStaticProjectToBundle(sampleProject);

  if (!result.success || !result.bundle) {
    throw new Error("Expected sample export bundle.");
  }

  return result.bundle;
}

async function createTempDir(): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "scroll3d-exporter-"));
  tempDirs.push(tempDir);

  return tempDir;
}
