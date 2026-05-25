import type { MockPipelineResult } from "../lib/mock-pipeline-client";

interface PipelineProgressSimpleProps {
  result: MockPipelineResult | null;
}

const friendlyStepNames: Record<string, string> = {
  prompt: "Understand prompt",
  image: "Design concept",
  video: "Plan motion",
  frame: "Build scroll scene",
  code: "Compile website"
};

export function PipelineProgressSimple({ result }: PipelineProgressSimpleProps) {
  const steps = result?.steps.map((step) => ({
    id: step.id,
    name: friendlyStepNames[step.id] ?? step.name,
    status: step.status
  })) ?? [
    { id: "prompt", name: "Understand prompt", status: "pending" },
    { id: "image", name: "Design concept", status: "pending" },
    { id: "video", name: "Plan motion", status: "pending" },
    { id: "frame", name: "Build scroll scene", status: "pending" },
    { id: "code", name: "Compile website", status: "pending" }
  ];

  return (
    <div className="simplePipeline" aria-label="Generation progress">
      {steps.map((step, index) => (
        <div key={step.id} className={`simplePipelineStep ${step.status}`}>
          <span className="workflowStepNumber">{String(index + 1)}</span>
          <strong>{step.name}</strong>
          <span className={`providerBadge ${step.status}`}>{step.status}</span>
        </div>
      ))}
    </div>
  );
}
