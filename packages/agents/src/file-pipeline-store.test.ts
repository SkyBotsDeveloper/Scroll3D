import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import {
  createPipelineRun,
  getNextRunnableStepIndex,
  updateStepStatus
} from "./pipeline-state";
import { FilePipelineRunStore } from "./file-pipeline-store";

function createTempRunStore(): FilePipelineRunStore {
  return new FilePipelineRunStore({
    storageDir: mkdtempSync(join(tmpdir(), "scroll3d-runs-"))
  });
}

describe("FilePipelineRunStore", () => {
  it("saves and loads a pipeline run", () => {
    const store = createTempRunStore();
    const run = createPipelineRun(sampleProject, "Build a saved pipeline");

    store.save(run);

    const loadedRun = store.get(run.id);

    expect(loadedRun?.id).toBe(run.id);
    expect(loadedRun?.steps).toHaveLength(5);
  });

  it("updates an existing pipeline run", () => {
    const store = createTempRunStore();
    const run = createPipelineRun(sampleProject, "Update a saved pipeline");
    const firstStep = run.steps[0];

    if (!firstStep) {
      throw new Error("Expected a first pipeline step.");
    }

    store.save(run);
    updateStepStatus(run, firstStep.id, "running", { input: { prompt: run.prompt } });
    store.save(run);

    expect(store.get(run.id)?.steps[0]?.status).toBe("running");
  });

  it("lists stored runs", () => {
    const store = createTempRunStore();

    store.save(createPipelineRun(sampleProject, "First stored run"));
    store.save(createPipelineRun(sampleProject, "Second stored run"));

    expect(store.list()).toHaveLength(2);
  });

  it("reports corrupt files with a clear error", () => {
    const storageDir = mkdtempSync(join(tmpdir(), "scroll3d-runs-"));
    const store = new FilePipelineRunStore({ storageDir });

    writeFileSync(join(storageDir, "corrupt.json"), "{not-json", "utf8");

    expect(() => store.list()).toThrow("Failed to read pipeline run from corrupt.json");
  });

  it("redacts secret-looking values in serialized output", () => {
    const storageDir = mkdtempSync(join(tmpdir(), "scroll3d-runs-"));
    const store = new FilePipelineRunStore({ storageDir });
    const run = createPipelineRun(sampleProject, "Secret-safe saved pipeline");

    run.events.push({
      id: "event_secret",
      type: "debug",
      message: "Should be redacted.",
      stepId: null,
      createdAt: new Date().toISOString(),
      metadata: {
        apiKey: "sk-test-secret",
        nested: {
          token: "token-value"
        }
      }
    });
    store.save(run);

    const savedFile = readFileSync(join(storageDir, `${run.id}.json`), "utf8");

    expect(savedFile).not.toContain("sk-test-secret");
    expect(savedFile).not.toContain("token-value");
    expect(savedFile).toContain("[redacted]");
  });

  it("can identify a stored run's next resumable step", () => {
    const store = createTempRunStore();
    const run = createPipelineRun(sampleProject, "Resume from stored state");
    const firstStep = run.steps[0];

    if (!firstStep) {
      throw new Error("Expected a first pipeline step.");
    }

    updateStepStatus(run, firstStep.id, "completed", {
      output: {
        title: "Stored plan",
        sections: [],
        visualPrompt: "Stored visual prompt",
        motionPrompt: "Stored motion prompt",
        sourcePrompt: run.prompt
      }
    });
    store.save(run);

    const storedRun = store.get(run.id);

    if (!storedRun) {
      throw new Error("Expected stored run.");
    }

    expect(getNextRunnableStepIndex(storedRun)).toBe(1);
  });
});
