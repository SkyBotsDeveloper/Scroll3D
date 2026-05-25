import type { MockPipelineStep } from "../lib/mock-pipeline-client";

interface PipelineStepListProps {
  steps: MockPipelineStep[];
}

export function PipelineStepList({ steps }: PipelineStepListProps) {
  return (
    <div className="pipelineStepList" aria-label="Pipeline steps">
      {steps.map((step, index) => (
        <div key={step.id} className={`pipelineStep ${step.status}`}>
          <span className="stepIndex">{String(index + 1)}</span>
          <div>
            <strong>{step.name}</strong>
            <span>{step.providerMode} provider</span>
            {step.artifact ? <small>{step.artifact}</small> : null}
            {step.warning ? <small>{step.warning}</small> : null}
          </div>
          <span className={`providerBadge ${step.status}`}>{step.status}</span>
        </div>
      ))}
    </div>
  );
}
