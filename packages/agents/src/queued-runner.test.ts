import { sampleProject } from "@scroll3d/core";
import { SequentialJobRunner } from "@scroll3d/local-runtime";
import {
  ProviderRegistry,
  getMockProviderPreset,
  mockProviderPresets
} from "@scroll3d/providers";
import { describe, expect, it } from "vitest";
import { QueuedAgentPipelineRunner } from "./index";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe("QueuedAgentPipelineRunner", () => {
  it("completes the full queued mock pipeline", async () => {
    const runner = new QueuedAgentPipelineRunner();

    const run = await runner.run(sampleProject, "Create a cinematic SaaS page");

    expect(run.status).toBe("completed");
    expect(run.steps.every((step) => step.status === "completed")).toBe(true);
    expect(run.artifacts.generatedImage?.type).toBe("image");
    expect(run.artifacts.generatedVideo?.type).toBe("video");
    expect(run.artifacts.frameManifest?.type).toBe("frame-manifest");
    expect(run.artifacts.siteCompilationPlan?.type).toBe("code");
  });

  it("matches provider types for every step", async () => {
    const runner = new QueuedAgentPipelineRunner();

    const run = await runner.run(sampleProject, "Create a cinematic SaaS page");

    expect(
      run.steps.map((step) => [step.agentType, step.requiredProviderType])
    ).toEqual([
      ["prompt", "llm"],
      ["image", "image"],
      ["video", "video"],
      ["frame", "frame"],
      ["code", "code"]
    ]);
  });

  it("passes outputs and artifacts between steps", async () => {
    const runner = new QueuedAgentPipelineRunner();

    const run = await runner.run(sampleProject, "Create a cinematic SaaS page");
    const promptOutput = run.steps[0]?.output as
      | { visualPrompt: string; motionPrompt: string }
      | undefined;
    const imageInput = run.steps[1]?.input as { visualPrompt: string } | undefined;
    const videoInput = run.steps[2]?.input as
      | { image: { id: string }; motionPrompt: string }
      | undefined;

    expect(imageInput?.visualPrompt).toBe(promptOutput?.visualPrompt);
    expect(videoInput?.image.id).toBe(run.artifacts.generatedImage?.id);
    expect(videoInput?.motionPrompt).toBe(promptOutput?.motionPrompt);
  });

  it("stops when a required provider is missing", async () => {
    const registry = createRegistryWithout("mock-video");
    const runner = new QueuedAgentPipelineRunner({ registry });

    const run = await runner.run(sampleProject, "Create a cinematic SaaS page");

    expect(run.status).toBe("failed");
    expect(run.steps[2]?.status).toBe("failed");
    expect(run.steps[3]?.status).toBe("pending");
  });

  it("retries from a failed step after provider recovery", async () => {
    const registry = createRegistryWithout("mock-video");
    const runner = new QueuedAgentPipelineRunner({ registry });
    const failedRun = await runner.run(sampleProject, "Create a cinematic SaaS page");
    const videoPreset = getMockProviderPreset("mock-video");

    if (!videoPreset) {
      throw new Error("Expected mock-video preset.");
    }

    registry.registerPreset(videoPreset);

    const retriedRun = await runner.retryFailedStep(failedRun.id, sampleProject);

    expect(retriedRun.status).toBe("completed");
    expect(retriedRun.steps[2]?.retryCount).toBe(1);
    expect(retriedRun.steps.every((step) => step.status === "completed")).toBe(true);
  });

  it("cancels a running pipeline", async () => {
    const runtime = new SequentialJobRunner({
      hooks: {
        beforeJobStart: async (job) => {
          if (job.metadata.stepId === "step_02_image-generation") {
            await wait(20);
          }
        }
      }
    });
    const runner = new QueuedAgentPipelineRunner({ runtime });
    const pendingRun = runner.run(sampleProject, "Create a cinematic SaaS page");

    let activeRunId: string | null = null;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const run = runner.listRuns()[0];

      if (run?.steps[1]?.status === "running") {
        activeRunId = run.id;
        break;
      }

      await wait(1);
    }

    expect(activeRunId).not.toBeNull();

    if (activeRunId) {
      expect(runner.cancelRun(activeRunId)).toBe(true);
    }

    const cancelledRun = await pendingRun;

    expect(cancelledRun.status).toBe("cancelled");
    expect(cancelledRun.steps.some((step) => step.status === "cancelled")).toBe(true);
  });

  it("does not run heavy runtime jobs in parallel", async () => {
    let activeHeavyJobs = 0;
    let maxActiveHeavyJobs = 0;
    const runtime = new SequentialJobRunner({
      hooks: {
        beforeJobStart: (job) => {
          if (job.heavy) {
            activeHeavyJobs += 1;
            maxActiveHeavyJobs = Math.max(maxActiveHeavyJobs, activeHeavyJobs);
          }
        },
        afterJobComplete: (job) => {
          if (job.heavy) {
            activeHeavyJobs -= 1;
          }
        },
        onJobFail: (job) => {
          if (job.heavy) {
            activeHeavyJobs -= 1;
          }
        }
      }
    });
    const runner = new QueuedAgentPipelineRunner({ runtime });

    await runner.run(sampleProject, "Create a cinematic SaaS page");

    expect(maxActiveHeavyJobs).toBe(1);
  });
});

function createRegistryWithout(presetIdToSkip: string): ProviderRegistry {
  const registry = new ProviderRegistry();

  for (const preset of mockProviderPresets) {
    if (preset.id !== presetIdToSkip && preset.config.enabled) {
      registry.registerPreset(preset);
    }
  }

  return registry;
}
