import { describe, expect, it } from "vitest";
import { sampleProject } from "./fixtures/sample-project";
import {
  AgentJobSchema,
  FrameSetSchema,
  isProjectMode,
  parseProject,
  safeParseProject,
  validateProject
} from "./index";

describe("Scroll3D project schemas", () => {
  it("valid sample project passes validation", () => {
    expect(() => parseProject(sampleProject)).not.toThrow();
    expect(validateProject(sampleProject)).toBe(true);
  });

  it("invalid project fails validation", () => {
    const invalidProject = {
      ...sampleProject,
      name: ""
    };

    expect(safeParseProject(invalidProject).success).toBe(false);
  });

  it("project mode validation works", () => {
    expect(isProjectMode("local")).toBe(true);
    expect(isProjectMode("api")).toBe(true);
    expect(isProjectMode("hybrid")).toBe(true);
    expect(isProjectMode("offline")).toBe(false);
  });

  it("frame set validation works", () => {
    const frameSet = sampleProject.scene.frameSets[0];

    expect(FrameSetSchema.safeParse(frameSet).success).toBe(true);
    expect(
      FrameSetSchema.safeParse({
        ...frameSet,
        frameCount: 0
      }).success
    ).toBe(false);
    expect(
      FrameSetSchema.safeParse({
        ...frameSet,
        target: "watch"
      }).success
    ).toBe(false);
  });

  it("agent job status validation works", () => {
    expect(
      AgentJobSchema.safeParse({
        id: "job_prompt_1",
        agentId: "agent_prompt",
        status: "pending",
        input: {
          prompt: "Create a cinematic SaaS landing page"
        }
      }).success
    ).toBe(true);

    expect(
      AgentJobSchema.safeParse({
        id: "job_prompt_2",
        agentId: "agent_prompt",
        status: "paused",
        input: {}
      }).success
    ).toBe(false);
  });
});
