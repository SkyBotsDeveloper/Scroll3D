import type { ProjectMode, Scroll3DProject } from "@scroll3d/core";
import { updateProjectMode, updateProjectName } from "../lib/project-updates";

interface ProjectBasicsEditorProps {
  project: Scroll3DProject;
  onChange: (project: Scroll3DProject) => void;
}

const projectModes: ProjectMode[] = ["local", "api", "hybrid"];

export function ProjectBasicsEditor({ project, onChange }: ProjectBasicsEditorProps) {
  return (
    <section className="editorSection" aria-labelledby="project-basics-title">
      <div className="sectionHeader">
        <p className="eyebrow">Project</p>
        <h3 id="project-basics-title">Basics</h3>
      </div>

      <label className="field">
        <span>Site name</span>
        <input
          value={project.name}
          onChange={(event) => {
            onChange(updateProjectName(project, event.target.value));
          }}
        />
      </label>

      <label className="field">
        <span>Mode</span>
        <select
          value={project.mode}
          onChange={(event) => {
            onChange(updateProjectMode(project, event.target.value as ProjectMode));
          }}
        >
          {projectModes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </label>

      <div className="readonlyGrid">
        <div>
          <span>Version</span>
          <strong>{project.version}</strong>
        </div>
        <div>
          <span>Created</span>
          <strong>{formatDate(project.createdAt)}</strong>
        </div>
        <div>
          <span>Updated</span>
          <strong>{formatDate(project.updatedAt)}</strong>
        </div>
      </div>
    </section>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}
