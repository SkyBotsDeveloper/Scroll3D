import { mkdtemp, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { sampleProject } from "@scroll3d/core";
import { afterEach, describe, expect, it } from "vitest";
import { runStaticExport } from "./run";

const tempDirs: string[] = [];

describe("runStaticExport", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs.map((tempDir) => rm(tempDir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  it("returns an in-memory bundle for the bundle target", async () => {
    const result = await runStaticExport(sampleProject, {
      target: "bundle"
    });

    expect(result.success).toBe(true);
    expect(
      result.bundleResult?.bundle?.files.some((file) => file.path === "index.html")
    ).toBe(true);
  });

  it("writes files for the directory target", async () => {
    const outputDir = await createTempDir();
    const result = await runStaticExport(sampleProject, {
      target: "directory",
      outputDir
    });

    expect(result.success).toBe(true);
    await expect(stat(path.join(outputDir, "index.html"))).resolves.toBeTruthy();
  });

  it("returns a ZIP buffer for the zip target", async () => {
    const result = await runStaticExport(sampleProject, {
      target: "zip",
      zipConfig: {
        filename: "scroll3d.zip"
      }
    });

    expect(result.success).toBe(true);
    expect(result.zipResult?.bytes).toBeGreaterThan(0);
    expect(result.zipResult?.buffer).toBeInstanceOf(Buffer);
  });

  it("fails clearly for invalid targets", async () => {
    const result = await runStaticExport(sampleProject, {
      target: "invalid"
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe("invalid-export-target");
  });
});

async function createTempDir(): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "scroll3d-run-"));
  tempDirs.push(tempDir);

  return tempDir;
}
