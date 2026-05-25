import type { Scroll3DProject, Section } from "@scroll3d/core";
import {
  moveSection,
  setSectionVisibility,
  updateSectionContent,
  updateSectionName
} from "../lib/project-updates";
import { getEditableContentFields, isSectionVisible } from "../lib/section-utils";

interface SectionEditorCardProps {
  project: Scroll3DProject;
  section: Section;
  index: number;
  total: number;
  onChange: (project: Scroll3DProject) => void;
}

export function SectionEditorCard({
  project,
  section,
  index,
  total,
  onChange
}: SectionEditorCardProps) {
  const visible = isSectionVisible(section);
  const fields = getEditableContentFields(section);

  return (
    <article className={visible ? "sectionCard" : "sectionCard mutedCard"}>
      <div className="sectionCardHeader">
        <div>
          <strong>{section.name}</strong>
          <span>
            {section.type} - {section.id} - order {String(section.order)}
          </span>
        </div>
        <div className="iconButtonRow">
          <button
            type="button"
            className="iconButton"
            title="Move section up"
            disabled={index === 0}
            onClick={() => {
              onChange(moveSection(project, section.id, "up"));
            }}
          >
            Up
          </button>
          <button
            type="button"
            className="iconButton"
            title="Move section down"
            disabled={index === total - 1}
            onClick={() => {
              onChange(moveSection(project, section.id, "down"));
            }}
          >
            Down
          </button>
        </div>
      </div>

      <div className="twoColumnFields">
        <label className="field">
          <span>Name</span>
          <input
            value={section.name}
            onChange={(event) => {
              onChange(updateSectionName(project, section.id, event.target.value));
            }}
          />
        </label>

        <label className="toggleField inlineToggle">
          <input
            type="checkbox"
            checked={visible}
            onChange={(event) => {
              onChange(setSectionVisibility(project, section.id, event.target.checked));
            }}
          />
          <span>Visible in export</span>
        </label>
      </div>

      <div className="contentFieldGrid">
        {fields.map((field) => (
          <label
            key={field.key}
            className={field.ctaLike ? "field highlightedField" : "field"}
          >
            <span>
              {field.key}
              {field.ctaLike ? " - CTA" : ""}
            </span>
            {field.kind === "complex" ? (
              <textarea
                className="compactTextarea"
                value={field.value}
                onChange={(event) => {
                  onChange(
                    updateSectionContent(
                      project,
                      section.id,
                      field.key,
                      event.target.value
                    )
                  );
                }}
              />
            ) : field.kind === "boolean" ? (
              <select
                value={field.value}
                onChange={(event) => {
                  onChange(
                    updateSectionContent(
                      project,
                      section.id,
                      field.key,
                      event.target.value
                    )
                  );
                }}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <input
                type={field.kind === "number" ? "number" : "text"}
                value={field.value}
                onChange={(event) => {
                  onChange(
                    updateSectionContent(
                      project,
                      section.id,
                      field.key,
                      event.target.value
                    )
                  );
                }}
              />
            )}
          </label>
        ))}
      </div>
    </article>
  );
}
