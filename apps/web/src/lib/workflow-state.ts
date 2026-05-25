export const consumerWorkflowSteps = [
  "prompt",
  "generate",
  "edit",
  "preview",
  "export"
] as const;

export type ConsumerWorkflowStep = (typeof consumerWorkflowSteps)[number];

export interface WorkflowStepInfo {
  id: ConsumerWorkflowStep;
  label: string;
  description: string;
}

export type WorkflowStepStatus = "upcoming" | "active" | "complete";

export const workflowStepInfo: WorkflowStepInfo[] = [
  {
    id: "prompt",
    label: "Prompt",
    description: "Describe the website."
  },
  {
    id: "generate",
    label: "Generate",
    description: "Build a website draft."
  },
  {
    id: "edit",
    label: "Edit",
    description: "Adjust text, theme, and sections."
  },
  {
    id: "preview",
    label: "Preview",
    description: "Review the draft."
  },
  {
    id: "export",
    label: "Export",
    description: "Download a static ZIP."
  }
];

export function getWorkflowStepIndex(step: ConsumerWorkflowStep): number {
  return consumerWorkflowSteps.indexOf(step);
}

export function getWorkflowStepStatus(
  currentStep: ConsumerWorkflowStep,
  step: ConsumerWorkflowStep
): WorkflowStepStatus {
  const currentIndex = getWorkflowStepIndex(currentStep);
  const stepIndex = getWorkflowStepIndex(step);

  if (stepIndex < currentIndex) {
    return "complete";
  }

  return stepIndex === currentIndex ? "active" : "upcoming";
}

export function getNextWorkflowStep(
  currentStep: ConsumerWorkflowStep
): ConsumerWorkflowStep {
  const currentIndex = getWorkflowStepIndex(currentStep);
  const nextIndex = Math.min(currentIndex + 1, consumerWorkflowSteps.length - 1);
  const nextStep = consumerWorkflowSteps[nextIndex];

  return nextStep ?? "export";
}

export function isConsumerWorkflowStep(value: unknown): value is ConsumerWorkflowStep {
  return (
    value === "prompt" ||
    value === "generate" ||
    value === "edit" ||
    value === "preview" ||
    value === "export"
  );
}
