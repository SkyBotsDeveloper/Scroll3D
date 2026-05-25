import type { Scroll3DProject } from "@scroll3d/core";
import { createExportProject } from "./project-updates";
import { formatProjectJson } from "./sample-project";
import { validateProjectJson, type ProjectValidationResult } from "./validation";

export type EditorTab = "visual" | "json" | "export" | "settings" | "prompt";

export interface SyncedProjectState {
  project: Scroll3DProject;
  projectJson: string;
  validation: ProjectValidationResult;
}

export function createSyncedProjectState(project: Scroll3DProject): SyncedProjectState {
  const projectJson = formatProjectJson(project);

  return {
    project,
    projectJson,
    validation: validateProjectJson(projectJson)
  };
}

export function createExportableProject(project: Scroll3DProject): Scroll3DProject {
  return createExportProject(project);
}

export function getDirtyState(currentJson: string, project: Scroll3DProject): boolean {
  return currentJson.trim() !== formatProjectJson(project).trim();
}
