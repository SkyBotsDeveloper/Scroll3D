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
          <p className="eyebrow">Visual</p>
          <h2 id="visual-editor-title">Structured project controls</h2>
        </div>
      </div>

      <ProjectBasicsEditor project={project} onChange={onChange} />
      <ThemeEditor project={project} onChange={onChange} />
      <SectionsEditor project={project} onChange={onChange} />
      <ScrollSceneEditor project={project} onChange={onChange} />
    </section>
  );
}
