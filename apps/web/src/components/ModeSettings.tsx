import type { ProjectMode } from "@scroll3d/core";
import type { Scroll3DSettings } from "../lib/settings-state";
import { updateSettingsTimestamp } from "../lib/settings-state";

interface ModeSettingsProps {
  settings: Scroll3DSettings;
  onChange: (settings: Scroll3DSettings) => void;
}

const modes: Array<{ value: ProjectMode; label: string; description: string }> = [
  {
    value: "api",
    label: "API",
    description: "Prefer configured API providers with mock fallback."
  },
  {
    value: "local",
    label: "Local",
    description: "Prefer local runtime providers when connected."
  },
  {
    value: "hybrid",
    label: "Hybrid",
    description: "Mix local/API preferences by pipeline stage."
  }
];

export function ModeSettings({ settings, onChange }: ModeSettingsProps) {
  return (
    <section className="editorSection" aria-labelledby="mode-settings-title">
      <div className="sectionHeader">
        <p className="eyebrow">Mode</p>
        <h3 id="mode-settings-title">Provider execution mode</h3>
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
            <span>{mode.description}</span>
          </button>
        ))}
      </div>

      <label className="toggleField">
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
        <span>Allow mock fallback for unavailable providers</span>
      </label>
    </section>
  );
}
