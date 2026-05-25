import { sampleProject } from "@scroll3d/core";
import {
  createMockProviders,
  MockCodeProvider,
  MockFrameProvider,
  MockImageProvider,
  MockLLMProvider
} from "@scroll3d/providers";
import { describe, expect, it } from "vitest";
import { AgentOrchestrator } from "./index";
import type { VideoGenerationInput } from "./contracts";

describe("AgentOrchestrator", () => {
  it("runs the full mock pipeline successfully", async () => {
    const orchestrator = new AgentOrchestrator({
      providers: createMockProviders()
    });

    const result = await orchestrator.run(
      sampleProject,
      "Create a cinematic SaaS landing page"
    );

    expect(result.status).toBe("completed");
    expect(result.jobs).toHaveLength(5);
    expect(result.jobs.every((job) => job.status === "completed")).toBe(true);
    expect(result.artifacts.generatedImage?.type).toBe("image");
    expect(result.artifacts.generatedVideo?.type).toBe("video");
    expect(result.artifacts.frameManifest?.type).toBe("frame-manifest");
    expect(result.artifacts.siteCompilationPlan?.type).toBe("code");
  });

  it("stops on failure when a required provider is missing", async () => {
    const orchestrator = new AgentOrchestrator({
      providers: [
        new MockLLMProvider(),
        new MockImageProvider(),
        new MockFrameProvider(),
        new MockCodeProvider()
      ]
    });

    const result = await orchestrator.run(sampleProject, "Build a landing page");

    expect(result.status).toBe("failed");
    expect(result.jobs).toHaveLength(3);
    expect(result.jobs[2]?.agentType).toBe("video");
    expect(result.jobs[2]?.status).toBe("failed");
  });

  it("matches every agent to the expected provider type", async () => {
    const orchestrator = new AgentOrchestrator({
      providers: createMockProviders()
    });

    const result = await orchestrator.run(sampleProject, "Build a landing page");

    expect(result.jobs.map((job) => [job.agentType, job.providerType])).toEqual([
      ["prompt", "llm"],
      ["image", "image"],
      ["video", "video"],
      ["frame", "frame"],
      ["code", "code"]
    ]);
  });

  it("passes artifacts between agents", async () => {
    const orchestrator = new AgentOrchestrator({
      providers: createMockProviders()
    });

    const result = await orchestrator.run(sampleProject, "Build a landing page");
    const videoInput = result.jobs[2]?.input as VideoGenerationInput | undefined;

    expect(videoInput?.image.id).toBe(result.artifacts.generatedImage?.id);
    expect(result.project.scene.sourceVideo).toBe(
      result.artifacts.generatedVideo?.path
    );
    expect(result.project.scene.frameSets).toHaveLength(2);
  });
});
