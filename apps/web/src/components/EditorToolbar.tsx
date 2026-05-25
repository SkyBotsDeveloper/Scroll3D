import type { Scroll3DProject } from "@scroll3d/core";
import type { ProjectValidationResult } from "../lib/validation";

interface EditorToolbarProps {
  project: Scroll3DProject;
  validation: ProjectValidationResult;
  dirty: boolean;
  fileCount: number;
  visibleSectionCount: number;
}

export function EditorToolbar({
  project,
  validation,
  dirty,
  fileCount,
  visibleSectionCount
}: EditorToolbarProps) {
  return (
    <section className="editorToolbar" aria-label="Project status">
      <div>
        <p className="eyebrow">Developer Preview</p>
        <h1>Scroll3D</h1>
        <p className="subtitle">Open-source AI 3D website builder</p>
        <p className="projectSubtitle">Editing: {project.name}</p>
        <div className="status" aria-label="Current Phase 10 status">
          <span className="statusDot" aria-hidden="true" />
          Settings, runtime planning, and mock prompt pipeline
        </div>
      </div>
      <div className="toolbarMeta" aria-label="Project metadata">
        <span className={validation.ok ? "statusPill ok" : "statusPill error"}>
          {validation.ok ? "Valid" : "Invalid JSON"}
        </span>
        <span className={dirty ? "statusPill warning" : "statusPill neutral"}>
          {dirty ? "JSON edits pending" : "Synced"}
        </span>
        <span>{String(visibleSectionCount)} visible sections</span>
        <span>{String(fileCount)} export files</span>
        <span>Creator: Siddhartha Abhimanyu</span>
        <span>Telegram: @iflexelite</span>
        <span>Instagram: elite.sid</span>
      </div>
    </section>
  );
}
