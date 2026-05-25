import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import { PipelineStepList } from "./PipelineStepList";

interface PipelineRunPanelProps {
  result: MockPipelineResult | null;
  onApply: () => void;
}

export function PipelineRunPanel({ result, onApply }: PipelineRunPanelProps) {
  if (!result) {
    return (
      <section className="editorSection" aria-labelledby="pipeline-run-title">
        <div className="sectionHeader">
          <p className="eyebrow">Pipeline</p>
          <h3 id="pipeline-run-title">No run yet</h3>
        </div>
        <p className="statusText">
          Run the mock prompt pipeline to see stage results and generated artifacts.
        </p>
      </section>
    );
  }

  return (
    <section className="editorSection" aria-labelledby="pipeline-run-title">
      <div className="sectionHeader splitHeader">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h3 id="pipeline-run-title">{result.id}</h3>
        </div>
        <span
          className={`statusPill ${result.status === "completed" ? "ok" : "error"}`}
        >
          {result.status}
        </span>
      </div>

      <PipelineStepList steps={result.steps} />

      <ul className="messageList">
        {result.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>

      <button
        type="button"
        className="primaryButton"
        disabled={!result.project}
        onClick={onApply}
      >
        Apply generated project update
      </button>
    </section>
  );
}
