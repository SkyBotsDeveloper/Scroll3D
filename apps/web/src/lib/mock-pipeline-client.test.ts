import { sampleProject, validateProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import {
  createInitialMockPipelineSteps,
  runMockPromptPipeline
} from "./mock-pipeline-client";
import { createDefaultSettings } from "./settings-state";

describe("mock pipeline client", () => {
  it("creates five deterministic initial steps", () => {
    expect(createInitialMockPipelineSteps().map((step) => step.id)).toEqual([
      "prompt",
      "image",
      "video",
      "frame",
      "code"
    ]);
  });

  it("generates a valid updated project", () => {
    const result = runMockPromptPipeline(
      sampleProject,
      "A cinematic logistics dashboard",
      createDefaultSettings()
    );

    expect(result.status).toBe("completed");
    expect(result.steps.every((step) => step.status === "completed")).toBe(true);
    expect(result.project?.name).toBe("A cinematic logistics dashboard");
    expect(result.project ? validateProject(result.project) : false).toBe(true);
  });

  it("fails safely for empty prompts", () => {
    const result = runMockPromptPipeline(sampleProject, " ", createDefaultSettings());

    expect(result.status).toBe("failed");
    expect(result.warnings).toContain("Prompt is required.");
  });
});
