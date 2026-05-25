import type { MockPipelineResult } from "../lib/mock-pipeline-client";

interface PipelineProgressSimpleProps {
  result: MockPipelineResult | null;
}

const friendlyStepNames: Record<string, string> = {
  prompt: "Understanding your idea",
  image: "Designing the website concept",
  video: "Planning the cinematic motion",
  frame: "Preparing scroll scenes",
  code: "Building your website draft"
};

export function PipelineProgressSimple({ result }: PipelineProgressSimpleProps) {
  const steps = result?.steps.map((step) => ({
    id: step.id,
    name: friendlyStepNames[step.id] ?? step.name,
    status: step.status
  })) ?? [
    { id: "prompt", name: "Understanding your idea", status: "pending" },
    { id: "image", name: "Designing the website concept", status: "pending" },
    { id: "video", name: "Planning the cinematic motion", status: "pending" },
    { id: "frame", name: "Preparing scroll scenes", status: "pending" },
    { id: "code", name: "Building your website draft", status: "pending" }
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
