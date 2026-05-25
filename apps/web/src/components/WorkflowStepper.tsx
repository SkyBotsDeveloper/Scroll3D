import {
  getWorkflowStepStatus,
  workflowStepInfo,
  type ConsumerWorkflowStep
} from "../lib/workflow-state";

interface WorkflowStepperProps {
  activeStep: ConsumerWorkflowStep;
  onStepChange: (step: ConsumerWorkflowStep) => void;
}

export function WorkflowStepper({ activeStep, onStepChange }: WorkflowStepperProps) {
  return (
    <nav className="workflowStepper" aria-label="Website creation steps">
      {workflowStepInfo.map((step, index) => {
        const status = getWorkflowStepStatus(activeStep, step.id);

        return (
          <button
            key={step.id}
            type="button"
            className={`workflowStepButton ${status}`}
            aria-current={status === "active" ? "step" : undefined}
            onClick={() => {
              onStepChange(step.id);
            }}
          >
            <span className="workflowStepNumber">{String(index + 1)}</span>
            <span>
              <strong>{step.label}</strong>
              <small>{step.description}</small>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
