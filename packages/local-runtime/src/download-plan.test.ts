import { describe, expect, it } from "vitest";
import {
  createModelDownloadPlan,
  estimateTotalDownloadSize,
  filterPlanByStage,
  getUnsupportedPlanEntries,
  summarizeDownloadPlan,
  validateDownloadPlan
} from "./download-plan";

const baseSpecs = {
  os: "test",
  arch: "x64",
  totalRamGB: 16,
  freeDiskGB: 100
};

describe("model download planning", () => {
  it("generates a Lite plan without performing downloads", () => {
    const plan = createModelDownloadPlan(baseSpecs, "lite");

    expect(plan.selectedPack).toBe("lite");
    expect(plan.entries.map((entry) => entry.modelId)).toEqual([
      "lite-prompt-llm",
      "lite-code-llm"
    ]);
    expect(plan.summary.noDownloadsPerformed).toBe(true);
    expect(validateDownloadPlan(plan)).toEqual([]);
  });

  it("generates a Balanced plan with stage entries", () => {
    const plan = createModelDownloadPlan(baseSpecs, "balanced");

    expect(filterPlanByStage(plan, "image")).toHaveLength(1);
    expect(plan.summary.stages).toContain("frame");
  });

  it("adds high-resource warnings for Pro entries", () => {
    const plan = createModelDownloadPlan(
      {
        ...baseSpecs,
        totalRamGB: 64,
        vramGB: 16,
        freeDiskGB: 200
      },
      "pro"
    );

    expect(plan.entries.some((entry) => entry.risks.includes("large-download"))).toBe(
      true
    );
    expect(plan.entries.some((entry) => entry.risks.includes("high-vram"))).toBe(true);
  });

  it("adds warnings when VRAM is missing", () => {
    const plan = createModelDownloadPlan(baseSpecs, "balanced");

    expect(plan.warnings.join(" ")).toContain("VRAM");
    expect(
      plan.entries.some((entry) => entry.warnings.join(" ").includes("VRAM"))
    ).toBe(true);
  });

  it("estimates total download size", () => {
    const plan = createModelDownloadPlan(baseSpecs, "balanced");

    expect(estimateTotalDownloadSize(plan)).toBe(26);
    expect(summarizeDownloadPlan(plan).totalEstimatedDownloadGB).toBe(26);
  });

  it("reports unsupported platform entries", () => {
    const plan = createModelDownloadPlan(
      {
        ...baseSpecs,
        arch: "mips"
      },
      "lite"
    );

    expect(getUnsupportedPlanEntries(plan)).toHaveLength(2);
  });

  it("does not require real download URLs", () => {
    const plan = createModelDownloadPlan(baseSpecs, "lite");

    expect(
      plan.entries.every((entry) =>
        entry.source.reference?.startsWith("placeholder://")
      )
    ).toBe(true);
  });
});
