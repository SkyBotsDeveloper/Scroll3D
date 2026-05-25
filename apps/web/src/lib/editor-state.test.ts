import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import {
  createExportableProject,
  createSyncedProjectState,
  getDirtyState
} from "./editor-state";
import { setSectionVisibility } from "./project-updates";

describe("editor state helpers", () => {
  it("creates synced project state", () => {
    const state = createSyncedProjectState(sampleProject);

    expect(state.project).toBe(sampleProject);
    expect(state.projectJson).toContain("project_saas_cinematic");
    expect(state.validation.ok).toBe(true);
  });

  it("detects dirty JSON state", () => {
    const state = createSyncedProjectState(sampleProject);

    expect(getDirtyState(state.projectJson, sampleProject)).toBe(false);
    expect(getDirtyState(`${state.projectJson}\n`, sampleProject)).toBe(false);
    expect(getDirtyState("{}", sampleProject)).toBe(true);
  });

  it("creates exportable project with hidden sections filtered", () => {
    const hidden = setSectionVisibility(sampleProject, "section_features", false);
    const exportable = createExportableProject(hidden);

    expect(
      exportable.pages[0]?.sections.some((section) => section.id === "section_features")
    ).toBe(false);
  });
});
