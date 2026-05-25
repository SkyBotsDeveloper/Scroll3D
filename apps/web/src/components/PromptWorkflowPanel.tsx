import type { Scroll3DProject } from "@scroll3d/core";
import { useState } from "react";
import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import {
  createInitialMockPipelineSteps,
  runMockPromptPipeline
} from "../lib/mock-pipeline-client";
import type { Scroll3DSettings } from "../lib/settings-state";
import { AlertBox } from "./AlertBox";
import { PipelineRunPanel } from "./PipelineRunPanel";
import { StatusBadge } from "./StatusBadge";

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
  const examples = [
    "Create a cinematic SaaS landing page for an AI analytics tool",
    "Build a luxury real estate 3D scroll website",
    "Make a futuristic portfolio with glowing motion sections"
  ];
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
    <section
      className="toolPanel promptPanel heroPromptCard"
      aria-labelledby="prompt-title"
    >
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Generate</p>
          <h2 id="prompt-title">Describe the cinematic website you want</h2>
          <p className="statusText">
            The developer preview runs deterministic mock providers, then applies a
            valid project update you can edit and export.
          </p>
        </div>
        <StatusBadge tone="warning">Mock providers</StatusBadge>
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

      <div className="promptChipList" aria-label="Example prompts">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            className="promptChip"
            onClick={() => {
              setPrompt(example);
            }}
          >
            {example}
          </button>
        ))}
      </div>

      <div className="readonlyGrid compactSummary">
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

      <AlertBox title="Developer preview note" tone="info">
        <p>
          Real API providers, local model downloads, local model execution, and frame
          extraction are planned for later phases.
        </p>
      </AlertBox>

      <button
        type="button"
        className="primaryButton primaryCta"
        disabled={running}
        onClick={() => {
          handleRun();
        }}
      >
        {running ? "Generating mock website..." : "Generate mock website"}
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
