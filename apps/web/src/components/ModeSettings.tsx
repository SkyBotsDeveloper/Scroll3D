import type { ProjectMode } from "@scroll3d/core";
import type { Scroll3DSettings } from "../lib/settings-state";
import { updateSettingsTimestamp } from "../lib/settings-state";

interface ModeSettingsProps {
  settings: Scroll3DSettings;
  onChange: (settings: Scroll3DSettings) => void;
}

const modes: Array<{
  value: ProjectMode;
  label: string;
  headline: string;
  description: string;
}> = [
  {
    value: "api",
    label: "API Mode",
    headline: "Use your provider keys",
    description: "Prefer configured API providers with mock fallback."
  },
  {
    value: "local",
    label: "Local Mode",
    headline: "Run models on your machine",
    description: "Prefer local runtime providers when connected."
  },
  {
    value: "hybrid",
    label: "Hybrid Mode",
    headline: "Mix local and API per stage",
    description: "Choose a different provider path for each pipeline step."
  }
];

export function ModeSettings({ settings, onChange }: ModeSettingsProps) {
  return (
    <section className="editorSection" aria-labelledby="mode-settings-title">
      <div className="sectionHeader">
        <p className="eyebrow">Mode</p>
        <h3 id="mode-settings-title">Choose how Scroll3D should run providers</h3>
        <p className="statusText">
          Mock fallback keeps the developer preview useful until real provider
          connections and model downloads are enabled.
        </p>
      </div>

      <div className="segmentedGrid">
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={
              settings.mode === mode.value ? "modeButton active" : "modeButton"
            }
            onClick={() => {
              onChange(
                updateSettingsTimestamp({
                  ...settings,
                  mode: mode.value
                })
              );
            }}
          >
            <strong>{mode.label}</strong>
            <em>{mode.headline}</em>
            <span>{mode.description}</span>
          </button>
        ))}
      </div>

      <label className="toggleField mockFallbackCard">
        <input
          type="checkbox"
          checked={settings.allowMockFallback}
          onChange={(event) => {
            onChange(
              updateSettingsTimestamp({
                ...settings,
                allowMockFallback: event.target.checked
              })
            );
          }}
        />
        <span>Mock Mode / mock fallback for safe developer preview</span>
      </label>
    </section>
  );
}
