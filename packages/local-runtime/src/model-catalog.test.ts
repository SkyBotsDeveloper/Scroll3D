import { describe, expect, it } from "vitest";
import {
  listModelPacks,
  recommendModelPack,
  validateModelCatalog
} from "./model-catalog";

describe("model catalog", () => {
  it("validates catalog and pack references", () => {
    expect(validateModelCatalog()).toEqual([]);
  });

  it("defines stage coverage metadata for every pack", () => {
    expect(listModelPacks().every((pack) => pack.stagesSupported.length > 0)).toBe(
      true
    );
  });

  it("recommends Lite for low spec hardware", () => {
    const recommendation = recommendModelPack({
      os: "test",
      arch: "x64",
      totalRamGB: 8,
      freeDiskGB: 80
    });

    expect(recommendation.recommendedPack.id).toBe("lite");
  });

  it("recommends Balanced with warnings when VRAM is missing", () => {
    const recommendation = recommendModelPack({
      os: "test",
      arch: "x64",
      totalRamGB: 16,
      freeDiskGB: 80
    });

    expect(recommendation.recommendedPack.id).toBe("balanced");
    expect(recommendation.warnings.join(" ")).toContain("VRAM");
  });

  it("recommends Pro for high spec hardware", () => {
    const recommendation = recommendModelPack({
      os: "test",
      arch: "x64",
      totalRamGB: 64,
      vramGB: 16,
      freeDiskGB: 200
    });

    expect(recommendation.recommendedPack.id).toBe("pro");
  });
});
