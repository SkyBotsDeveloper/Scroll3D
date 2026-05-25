import type { PlaybackMode, Scroll3DProject } from "@scroll3d/core";
import {
  moveSection,
  setSectionVisibility,
  updatePlaybackMode,
  updateProjectName,
  updateScrollLength,
  updateSectionContent,
  updateSectionName,
  updateThemeColor,
  updateThemeRadius,
  updateThemeTypography
} from "../lib/project-updates";
import {
  getEditableContentFields,
  getOrderedSections,
  getVisibleSectionCount,
  isSectionVisible
} from "../lib/section-utils";
import {
  getThemeColor,
  getThemeRadius,
  getThemeTypography,
  isLikelyCssColor,
  normalizeCssColorInput
} from "../lib/theme-utils";

interface SimpleEditPanelProps {
  project: Scroll3DProject;
  onChange: (project: Scroll3DProject) => void;
  onPreview: () => void;
}

const colorKeys = [
  ["background", "Background"],
  ["accent", "Accent"],
  ["foreground", "Text"]
] as const;
const playbackModes: PlaybackMode[] = ["scroll", "scrub", "hybrid"];

export function SimpleEditPanel({
  project,
  onChange,
  onPreview
}: SimpleEditPanelProps) {
  const sections = getOrderedSections(project);

  return (
    <section className="consumerPanel simpleEditPanel" aria-labelledby="edit-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Edit</p>
          <h2 id="edit-title">Fine-tune the website</h2>
          <p className="statusText">
            Change the name, theme, section text, and scroll feel. Everything syncs to
            preview and export.
          </p>
        </div>
        <span className="inlineStat">
          {String(getVisibleSectionCount(project))} / {String(sections.length)} sections
          visible
        </span>
      </div>

      <label className="field highlightedField">
        <span>Project name</span>
        <input
          value={project.name}
          onChange={(event) => {
            onChange(updateProjectName(project, event.target.value));
          }}
        />
      </label>

      <section className="simpleEditGroup" aria-labelledby="theme-title">
        <div className="sectionHeader">
          <h3 id="theme-title">Theme</h3>
          <p className="statusText">Keep the look polished with a few core controls.</p>
        </div>
        <div className="colorGrid">
          {colorKeys.map(([key, label]) => {
            const value = getThemeColor(project, key);

            return (
              <label key={key} className="field colorField">
                <span>{label}</span>
                <div>
                  <input
                    type="color"
                    value={isLikelyCssColor(value) ? value : "#ffffff"}
                    aria-label={`${label} color`}
                    onChange={(event) => {
                      onChange(updateThemeColor(project, key, event.target.value));
                    }}
                  />
                  <input
                    value={value}
                    onChange={(event) => {
                      onChange(
                        updateThemeColor(
                          project,
                          key,
                          normalizeCssColorInput(event.target.value)
                        )
                      );
                    }}
                  />
                </div>
              </label>
            );
          })}
        </div>
        <div className="twoColumnFields">
          <label className="field">
            <span>Font</span>
            <input
              value={getThemeTypography(project, "fontFamily")}
              onChange={(event) => {
                onChange(
                  updateThemeTypography(project, "fontFamily", event.target.value)
                );
              }}
            />
          </label>
          <label className="field">
            <span>Corner radius</span>
            <input
              value={getThemeRadius(project, "md")}
              onChange={(event) => {
                onChange(updateThemeRadius(project, "md", event.target.value));
              }}
            />
          </label>
        </div>
      </section>

      <section className="simpleEditGroup" aria-labelledby="sections-title">
        <div className="sectionHeader">
          <h3 id="sections-title">Sections</h3>
          <p className="statusText">Edit the visible copy and reorder the story.</p>
        </div>
        <div className="simpleSectionList">
          {sections.map((section, index) => {
            const visible = isSectionVisible(section);
            const fields = getEditableContentFields(section).filter(
              (field) => field.kind !== "complex"
            );

            return (
              <article
                key={section.id}
                className={`simpleSectionCard ${visible ? "" : "mutedCard"}`}
              >
                <div className="sectionCardHeader">
                  <div>
                    <div className="badgeRow">
                      <span className="miniBadge">{section.type}</span>
                      <span className={visible ? "miniBadge ok" : "miniBadge muted"}>
                        {visible ? "visible" : "hidden"}
                      </span>
                    </div>
                    <label className="field">
                      <span>Section name</span>
                      <input
                        value={section.name}
                        onChange={(event) => {
                          onChange(
                            updateSectionName(project, section.id, event.target.value)
                          );
                        }}
                      />
                    </label>
                  </div>
                  <div className="iconButtonRow">
                    <button
                      type="button"
                      className="iconButton"
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
                      disabled={index === sections.length - 1}
                      onClick={() => {
                        onChange(moveSection(project, section.id, "down"));
                      }}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="iconButton"
                      onClick={() => {
                        onChange(setSectionVisibility(project, section.id, !visible));
                      }}
                    >
                      {visible ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="contentFieldGrid">
                  {fields.map((field) => (
                    <label
                      key={field.key}
                      className={field.ctaLike ? "field highlightedField" : "field"}
                    >
                      <span>{field.ctaLike ? `${field.key} (button)` : field.key}</span>
                      {field.kind === "boolean" ? (
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
          })}
        </div>
      </section>

      <section className="simpleEditGroup" aria-labelledby="scroll-feel-title">
        <div className="sectionHeader">
          <h3 id="scroll-feel-title">Scroll feel</h3>
          <p className="statusText">Tune how the cinematic scene responds to scroll.</p>
        </div>
        <div className="twoColumnFields">
          <label className="field">
            <span>Scroll length</span>
            <input
              type="number"
              min={1}
              value={project.scene.scrollLength}
              onChange={(event) => {
                onChange(updateScrollLength(project, Number(event.target.value)));
              }}
            />
          </label>
          <label className="field">
            <span>Playback mode</span>
            <select
              value={project.scene.playbackMode}
              onChange={(event) => {
                onChange(
                  updatePlaybackMode(project, event.target.value as PlaybackMode)
                );
              }}
            >
              {playbackModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <button type="button" className="primaryButton primaryCta" onClick={onPreview}>
        Preview changes
      </button>
    </section>
  );
}
