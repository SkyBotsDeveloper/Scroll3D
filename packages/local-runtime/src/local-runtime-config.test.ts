import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  createDefaultLocalRuntimeConfig,
  createLocalRuntimeConfigPlan,
  getModelsForStage,
  getReadyModels,
  loadLocalRuntimeConfig,
  saveLocalRuntimeConfig,
  updateModelStatus,
  validateLocalRuntimeConfig
} from "./local-runtime-config";

describe("local runtime config file foundation", () => {
  it("creates a valid default config", () => {
    const config = createDefaultLocalRuntimeConfig("lite");
    const validation = validateLocalRuntimeConfig(config);

    expect(validation.success).toBe(true);
    expect(config.maxConcurrentHeavyJobs).toBe(1);
    expect(config.selectedModelPack).toBe("lite");
  });

  it("saves and loads config from a temp directory", async () => {
    const dir = await mkdtemp(join(tmpdir(), "scroll3d-runtime-"));
    const filePath = join(dir, "local-runtime.config.json");
    const config = createDefaultLocalRuntimeConfig("balanced");

    try {
      await saveLocalRuntimeConfig(filePath, config);
      const loaded = await loadLocalRuntimeConfig(filePath);

      expect(loaded.selectedModelPack).toBe("balanced");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("creates setup plans with selected pack stored", () => {
    const plan = createLocalRuntimeConfigPlan(
      {
        os: "test",
        arch: "x64",
        totalRamGB: 16
      },
      "lite"
    );

    expect(plan.config.selectedModelPack).toBe("lite");
    expect(plan.warnings.join(" ")).toContain("No model downloads");
  });

  it("updates model statuses and filters ready models", () => {
    const config = createDefaultLocalRuntimeConfig("lite");
    const model = getModelsForStage(config, "prompt")[0];

    if (!model) {
      throw new Error("Expected prompt model.");
    }

    const updated = updateModelStatus(config, model.id, "ready");

    expect(getReadyModels(updated).map((candidate) => candidate.id)).toContain(
      model.id
    );
  });

  it("rejects raw secret-looking config values", () => {
    const config = {
      ...createDefaultLocalRuntimeConfig("lite"),
      modelCacheDir: "sk-secret-value"
    };

    expect(validateLocalRuntimeConfig(config).success).toBe(false);
  });
});
