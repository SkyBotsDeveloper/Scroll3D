import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import {
  appendArtifact,
  createPipelineRun,
  getNextRunnableStepIndex,
  markPipelineCancelled,
  markPipelineFailed,
  preparePipelineRunForResume,
  serializePipelineRun,
  updateStepStatus
} from "./index";

describe("pipeline state", () => {
  it("creates a pipeline with five expected steps", () => {
    const run = createPipelineRun(sampleProject, "Build a SaaS landing page");

    expect(run.status).toBe("pending");
    expect(run.steps.map((step) => step.agentType)).toEqual([
      "prompt",
      "image",
      "video",
      "frame",
      "code"
    ]);
  });

  it("records artifacts between steps", () => {
    const run = createPipelineRun(sampleProject, "Build a SaaS landing page");
    const imageStep = run.steps[1];

    if (!imageStep) {
      throw new Error("Expected image step.");
    }

    appendArtifact(run, imageStep.id, "generatedImage", {
      id: "image-1",
      type: "image",
      path: "/mock/image.webp",
      metadata: {}
    });

    expect(run.artifacts.generatedImage?.id).toBe("image-1");
    expect(imageStep.artifacts.generatedImage?.path).toBe("/mock/image.webp");
  });

  it("marks the pipeline failed when a step fails", () => {
    const run = createPipelineRun(sampleProject, "Build a SaaS landing page");
    const videoStep = run.steps[2];

    if (!videoStep) {
      throw new Error("Expected video step.");
    }

    updateStepStatus(run, videoStep.id, "failed", { error: "Video failed" });
    markPipelineFailed(run, videoStep.id, "Video failed");

    expect(run.status).toBe("failed");
    expect(videoStep.status).toBe("failed");
  });

  it("marks the pipeline cancelled", () => {
    const run = createPipelineRun(sampleProject, "Build a SaaS landing page");
    const imageStep = run.steps[1];

    if (!imageStep) {
      throw new Error("Expected image step.");
    }

    markPipelineCancelled(run, imageStep.id);

    expect(run.status).toBe("cancelled");
  });

  it("does not resume a cancelled pipeline unless explicitly allowed", () => {
    const run = createPipelineRun(sampleProject, "Build a SaaS landing page");
    const imageStep = run.steps[1];

    if (!imageStep) {
      throw new Error("Expected image step.");
    }

    updateStepStatus(run, imageStep.id, "cancelled");
    markPipelineCancelled(run, imageStep.id);

    expect(getNextRunnableStepIndex(run)).toBe(-1);
    expect(getNextRunnableStepIndex(run, { allowCancelled: true })).toBe(1);
  });

  it("preserves completed artifacts when preparing a failed step retry", () => {
    const run = createPipelineRun(sampleProject, "Build a SaaS landing page");
    const imageStep = run.steps[1];
    const videoStep = run.steps[2];

    if (!imageStep || !videoStep) {
      throw new Error("Expected image and video steps.");
    }

    updateStepStatus(run, imageStep.id, "completed");
    appendArtifact(run, imageStep.id, "generatedImage", {
      id: "image-1",
      type: "image",
      path: "/mock/image.webp",
      metadata: {}
    });
    updateStepStatus(run, videoStep.id, "failed", { error: "Video failed" });
    markPipelineFailed(run, videoStep.id, "Video failed");

    const retryIndex = getNextRunnableStepIndex(run, { retryFailed: true });
    preparePipelineRunForResume(run, retryIndex, { retryFailed: true });

    expect(run.artifacts.generatedImage?.id).toBe("image-1");
    expect(videoStep.status).toBe("pending");
    expect(videoStep.retryCount).toBe(1);
  });

  it("serializes without exposing secret-like values", () => {
    const run = createPipelineRun(sampleProject, "Build a SaaS landing page");
    run.events.push({
      id: "event-secret",
      type: "debug",
      message: "metadata should be redacted",
      stepId: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      metadata: {
        apiKey: "raw-secret",
        nested: {
          token: "raw-token"
        }
      }
    });

    const serialized = JSON.stringify(serializePipelineRun(run));

    expect(serialized).not.toContain("raw-secret");
    expect(serialized).not.toContain("raw-token");
    expect(serialized).toContain("[redacted]");
  });
});
