import type { Scroll3DProject } from "@scroll3d/core";
import { getOrderedSections, getVisibleSectionCount } from "../lib/section-utils";
import { SectionEditorCard } from "./SectionEditorCard";

interface SectionsEditorProps {
  project: Scroll3DProject;
  onChange: (project: Scroll3DProject) => void;
}

export function SectionsEditor({ project, onChange }: SectionsEditorProps) {
  const sections = getOrderedSections(project);

  return (
    <section className="editorSection" aria-labelledby="sections-editor-title">
      <div className="sectionHeader splitHeader">
        <div>
          <p className="eyebrow">Sections</p>
          <h3 id="sections-editor-title">Content, order, and visibility</h3>
          <p className="statusText">
            Edit common copy fields directly. Complex nested content stays editable as
            JSON text.
          </p>
        </div>
        <span className="inlineStat">
          {String(getVisibleSectionCount(project))} / {String(sections.length)} visible
        </span>
      </div>

      <div className="sectionList">
        {sections.map((section, index) => (
          <SectionEditorCard
            key={section.id}
            project={project}
            section={section}
            index={index}
            total={sections.length}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}
