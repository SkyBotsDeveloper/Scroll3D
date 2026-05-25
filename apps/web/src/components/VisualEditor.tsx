import type { Scroll3DProject } from "@scroll3d/core";
import { ProjectBasicsEditor } from "./ProjectBasicsEditor";
import { ScrollSceneEditor } from "./ScrollSceneEditor";
import { SectionsEditor } from "./SectionsEditor";
import { ThemeEditor } from "./ThemeEditor";

interface VisualEditorProps {
  project: Scroll3DProject;
  onChange: (project: Scroll3DProject) => void;
}

export function VisualEditor({ project, onChange }: VisualEditorProps) {
  return (
    <section className="toolPanel visualEditor" aria-labelledby="visual-editor-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Visual Editor</p>
          <h2 id="visual-editor-title">Shape the generated website</h2>
          <p className="statusText">
            Changes sync to JSON, preview, generated files, and ZIP export
            automatically.
          </p>
        </div>
      </div>

      <ProjectBasicsEditor project={project} onChange={onChange} />
      <ThemeEditor project={project} onChange={onChange} />
      <SectionsEditor project={project} onChange={onChange} />
      <ScrollSceneEditor project={project} onChange={onChange} />
    </section>
  );
}
