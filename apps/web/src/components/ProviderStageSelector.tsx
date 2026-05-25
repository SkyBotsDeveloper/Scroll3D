import type { StageProviderStatus } from "../lib/provider-preferences";
import { updateStagePreference } from "../lib/provider-preferences";
import type { Scroll3DSettings, StageProviderPreference } from "../lib/settings-state";

interface ProviderStageSelectorProps {
  settings: Scroll3DSettings;
  status: StageProviderStatus;
  onChange: (settings: Scroll3DSettings) => void;
}

const preferences: StageProviderPreference[] = ["auto", "api", "local", "mock"];

export function ProviderStageSelector({
  settings,
  status,
  onChange
}: ProviderStageSelectorProps) {
  return (
    <div className="providerStage">
      <div>
        <strong>{status.label}</strong>
        <span>{status.explanation}</span>
        {status.missingConfig ? <small>{status.missingConfig}</small> : null}
      </div>
      <label className="field">
        <span>Preference</span>
        <select
          value={settings.providerPreferences[status.stage]}
          onChange={(event) => {
            onChange(
              updateStagePreference(
                settings,
                status.stage,
                event.target.value as StageProviderPreference
              )
            );
          }}
        >
          {preferences.map((preference) => (
            <option key={preference} value={preference}>
              {preference}
            </option>
          ))}
        </select>
      </label>
      <span className={`providerBadge ${status.status}`}>
        {status.providerLabel} - {status.status}
      </span>
    </div>
  );
}
