import { describe, expect, it } from "vitest";
import {
  getNextWorkflowStep,
  getWorkflowStepStatus,
  isConsumerWorkflowStep
} from "./workflow-state";

describe("consumer workflow state", () => {
  it("marks prior, current, and upcoming steps", () => {
    expect(getWorkflowStepStatus("edit", "prompt")).toBe("complete");
    expect(getWorkflowStepStatus("edit", "edit")).toBe("active");
    expect(getWorkflowStepStatus("edit", "export")).toBe("upcoming");
  });

  it("advances until export", () => {
    expect(getNextWorkflowStep("prompt")).toBe("generate");
    expect(getNextWorkflowStep("export")).toBe("export");
  });

  it("validates workflow step ids", () => {
    expect(isConsumerWorkflowStep("preview")).toBe(true);
    expect(isConsumerWorkflowStep("settings")).toBe(false);
  });
});
