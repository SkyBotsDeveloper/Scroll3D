import { describe, expect, it } from "vitest";
import {
  formatSystemSpecs,
  isPackCompatible,
  listModelPacks,
  recommendModelPack,
  type SystemSpecs
} from "./model-recommendations";

describe("model recommendations", () => {
  it("recommends Lite for low specs", () => {
    expect(
      recommendModelPack(specs({ totalRamGB: 8, vramGB: 0 })).recommendedPack.id
    ).toBe("lite");
  });

  it("recommends Balanced for mid specs", () => {
    expect(
      recommendModelPack(specs({ totalRamGB: 24, vramGB: 8 })).recommendedPack.id
    ).toBe("balanced");
  });

  it("recommends Pro for high specs", () => {
    expect(
      recommendModelPack(specs({ totalRamGB: 64, vramGB: 16 })).recommendedPack.id
    ).toBe("pro");
  });

  it("reports incompatible packs with reasons", () => {
    const result = recommendModelPack(specs({ totalRamGB: 8, vramGB: 0 }));

    expect(result.incompatiblePacks.some((item) => item.pack.id === "pro")).toBe(true);
    expect(result.incompatiblePacks[0]?.reasons.length).toBeGreaterThan(0);
  });

  it("handles missing specs safely", () => {
    const result = recommendModelPack(specs({}));

    expect(result.recommendedPack.id).toBe("lite");
    expect(result.warnings).toContain(
      "Hardware details are incomplete in browser scan."
    );
  });

  it("checks compatibility and formats specs", () => {
    const lite = listModelPacks().find((pack) => pack.id === "lite");

    if (!lite) {
      throw new Error("Expected lite pack.");
    }

    expect(isPackCompatible(specs({ totalRamGB: 8, vramGB: 0 }), lite)).toBe(true);
    expect(formatSystemSpecs(specs({ totalRamGB: 8 }))).toContain("Total RAM: 8 GB");
  });
});

function specs(overrides: Partial<SystemSpecs>): SystemSpecs {
  return {
    os: "TestOS",
    arch: "x64",
    ...overrides
  };
}
