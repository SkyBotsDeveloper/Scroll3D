import type { Scroll3DProject } from "@scroll3d/core";
import { useState } from "react";
import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import {
  createInitialMockPipelineSteps,
  runMockPromptPipeline
} from "../lib/mock-pipeline-client";
import type { Scroll3DSettings } from "../lib/settings-state";
import { PipelineRunPanel } from "./PipelineRunPanel";

interface PromptWorkflowPanelProps {
  project: Scroll3DProject;
  settings: Scroll3DSettings;
  result: MockPipelineResult | null;
  onResult: (result: MockPipelineResult) => void;
  onApply: (project: Scroll3DProject) => void;
}

export function PromptWorkflowPanel({
  project,
  settings,
  result,
  onResult,
  onApply
}: PromptWorkflowPanelProps) {
  const [prompt, setPrompt] = useState(
    "A cinematic SaaS launch page for an analytics product"
  );
  const [running, setRunning] = useState(false);
  const displayedResult =
    result ??
    ({
      id: "mock-run-preview",
      prompt: "",
      status: "completed",
      steps: createInitialMockPipelineSteps(),
      artifacts: {},
      warnings: []
    } satisfies MockPipelineResult);

  function handleRun() {
    setRunning(true);
    const nextResult = runMockPromptPipeline(project, prompt, settings);
    onResult(nextResult);
    setRunning(false);
  }

  return (
    <section className="toolPanel promptPanel" aria-labelledby="prompt-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Prompt</p>
          <h2 id="prompt-title">Generate with mock pipeline</h2>
        </div>
      </div>

      <label className="field">
        <span>Website prompt</span>
        <textarea
          className="compactTextarea promptTextarea"
          value={prompt}
          onChange={(event) => {
            setPrompt(event.target.value);
          }}
        />
      </label>

      <div className="readonlyGrid">
        <div>
          <span>Mode</span>
          <strong>{settings.mode}</strong>
        </div>
        <div>
          <span>Provider path</span>
          <strong>
            {settings.allowMockFallback ? "mock fallback" : "configured only"}
          </strong>
        </div>
        <div>
          <span>Execution</span>
          <strong>sequential mock</strong>
        </div>
      </div>

      <button
        type="button"
        className="primaryButton"
        disabled={running}
        onClick={() => {
          handleRun();
        }}
      >
        {running ? "Generating..." : "Generate with mock pipeline"}
      </button>

      <PipelineRunPanel
        result={result ? displayedResult : null}
        onApply={() => {
          if (result?.project) {
            onApply(result.project);
          }
        }}
      />
    </section>
  );
}
