import { describe, expect, it } from "vitest";
import { createLocalRuntimeConfig, safeParseLocalRuntimeConfig } from "./index";

describe("local runtime config", () => {
  it("accepts valid config", () => {
    const result = safeParseLocalRuntimeConfig({
      maxConcurrentHeavyJobs: 1,
      tempDir: ".tmp",
      storageDir: ".runs",
      modelCacheDir: ".models",
      allowMockFallback: true
    });

    expect(result.success).toBe(true);
  });

  it("rejects unsupported heavy concurrency", () => {
    const result = safeParseLocalRuntimeConfig({
      maxConcurrentHeavyJobs: 2
    });

    expect(result.success).toBe(false);
  });

  it("applies defaults", () => {
    const config = createLocalRuntimeConfig();

    expect(config.maxConcurrentHeavyJobs).toBe(1);
    expect(config.tempDir).toBe(".scroll3d/tmp");
    expect(config.storageDir).toBe(".scroll3d/runs");
    expect(config.modelCacheDir).toBe(".scroll3d/models");
    expect(config.allowMockFallback).toBe(true);
  });
});
