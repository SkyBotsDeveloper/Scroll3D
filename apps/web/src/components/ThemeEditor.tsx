import type { Scroll3DProject } from "@scroll3d/core";
import {
  updateThemeColor,
  updateThemeEffect,
  updateThemeRadius,
  updateThemeSpacing,
  updateThemeTypography
} from "../lib/project-updates";
import {
  editableColorKeys,
  editableRadiusKeys,
  getThemeColor,
  getThemeRadius,
  getThemeTypography,
  isLikelyCssColor,
  normalizeCssColorInput
} from "../lib/theme-utils";

interface ThemeEditorProps {
  project: Scroll3DProject;
  onChange: (project: Scroll3DProject) => void;
}

const spacingKeys = ["xs", "sm", "md", "lg", "xl", "section"];

export function ThemeEditor({ project, onChange }: ThemeEditorProps) {
  return (
    <section className="editorSection" aria-labelledby="theme-editor-title">
      <div className="sectionHeader">
        <p className="eyebrow">Theme</p>
        <h3 id="theme-editor-title">Colors, type, radius</h3>
      </div>

      <div className="colorGrid">
        {editableColorKeys.map((key) => {
          const value = getThemeColor(project, key);

          return (
            <label key={key} className="field colorField">
              <span>{key}</span>
              <div>
                <input
                  type="color"
                  value={isLikelyCssColor(value) ? value : "#ffffff"}
                  aria-label={`${key} color picker`}
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
          <span>Body font</span>
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
          <span>Heading font</span>
          <input
            value={getThemeTypography(project, "headingFontFamily")}
            onChange={(event) => {
              onChange(
                updateThemeTypography(project, "headingFontFamily", event.target.value)
              );
            }}
          />
        </label>
      </div>

      <div className="threeColumnFields">
        {editableRadiusKeys.map((key) => (
          <label key={key} className="field">
            <span>Radius {key}</span>
            <input
              value={getThemeRadius(project, key)}
              onChange={(event) => {
                onChange(updateThemeRadius(project, key, event.target.value));
              }}
            />
          </label>
        ))}
      </div>

      <div className="threeColumnFields">
        {spacingKeys.map((key) => (
          <label key={key} className="field">
            <span>Spacing {key}</span>
            <input
              value={project.theme.spacing[key] ?? ""}
              onChange={(event) => {
                onChange(updateThemeSpacing(project, key, event.target.value));
              }}
            />
          </label>
        ))}
      </div>

      <label className="toggleField">
        <input
          type="checkbox"
          checked={project.theme.effects.depthFog === true}
          onChange={(event) => {
            onChange(updateThemeEffect(project, "depthFog", event.target.checked));
          }}
        />
        <span>Depth fog effect</span>
      </label>
    </section>
  );
}
