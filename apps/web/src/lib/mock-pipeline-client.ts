import type { JsonValue, Scroll3DProject } from "@scroll3d/core";
import { validateProject } from "@scroll3d/core";
import type { Scroll3DSettings } from "./settings-state";
import { pipelineStages, type PipelineStage } from "./settings-state";
import { updateProjectName, updateSectionContent } from "./project-updates";

export type MockPipelineStepStatus = "pending" | "running" | "completed" | "failed";

export interface MockPipelineStep {
  id: PipelineStage;
  name: string;
  status: MockPipelineStepStatus;
  providerMode: "mock";
  artifact?: string;
  warning?: string;
}

export interface MockPipelineResult {
  id: string;
  prompt: string;
  status: "completed" | "failed";
  steps: MockPipelineStep[];
  artifacts: Record<string, JsonValue>;
  warnings: string[];
  project?: Scroll3DProject;
}

const stepNames: Record<PipelineStage, string> = {
  prompt: "Prompt Understanding",
  image: "Image Generation",
  video: "Video Generation",
  frame: "Frame Extraction",
  code: "Website Compilation"
};

export function createInitialMockPipelineSteps(): MockPipelineStep[] {
  return pipelineStages.map((stage) => ({
    id: stage,
    name: stepNames[stage],
    status: "pending",
    providerMode: "mock"
  }));
}

export function runMockPromptPipeline(
  project: Scroll3DProject,
  prompt: string,
  settings: Scroll3DSettings
): MockPipelineResult {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    return {
      id: createRunId(),
      prompt,
      status: "failed",
      steps: createInitialMockPipelineSteps(),
      artifacts: {},
      warnings: ["Prompt is required."]
    };
  }

  const artifacts: Record<string, JsonValue> = {
    plan: {
      prompt: trimmedPrompt,
      mode: settings.mode,
      sections: ["hero", "features", "pricing", "faq"]
    },
    image: "mock://image/scroll3d-preview.webp",
    video: "mock://video/scroll3d-motion.mp4",
    frames: "mock://frames/manifest.json"
  };
  const nextProject = applyPromptToProject(project, trimmedPrompt);
  const valid = validateProject(nextProject);
  const steps: MockPipelineStep[] = createInitialMockPipelineSteps().map((step) => {
    const artifact = artifacts[step.id];
    const warning =
      step.id === "video" || step.id === "frame"
        ? "Mock artifact only. Real generation is not implemented yet."
        : undefined;

    return {
      ...step,
      status: valid ? "completed" : "failed",
      ...(artifact ? { artifact: formatArtifactValue(artifact) } : {}),
      ...(warning ? { warning } : {})
    };
  });

  return {
    id: createRunId(),
    prompt: trimmedPrompt,
    status: valid ? "completed" : "failed",
    steps,
    artifacts,
    warnings: [
      "Mock providers were used for every stage.",
      "No network calls, model execution, downloads, or frame extraction occurred."
    ],
    ...(valid ? { project: nextProject } : {})
  };
}

function applyPromptToProject(
  project: Scroll3DProject,
  prompt: string
): Scroll3DProject {
  const title = createProjectTitle(prompt);
  let nextProject = updateProjectName(project, title);

  nextProject = updateSectionContent(nextProject, "section_hero", "headline", title);
  nextProject = updateSectionContent(
    nextProject,
    "section_hero",
    "subheadline",
    `Generated mock direction from prompt: ${prompt}`
  );
  nextProject = updateSectionContent(
    nextProject,
    "section_features",
    "headline",
    "Mock-generated feature narrative"
  );

  return nextProject;
}

function createProjectTitle(prompt: string): string {
  const words = prompt
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 6);

  return words.length > 0 ? words.join(" ") : "Mock Generated Scroll3D Site";
}

function createRunId(): string {
  return `mock-run-${String(Date.now())}`;
}

function formatArtifactValue(value: JsonValue): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}
