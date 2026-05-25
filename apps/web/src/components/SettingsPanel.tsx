import type { SystemScanResult } from "../lib/model-recommendations";
import type { Scroll3DSettings } from "../lib/settings-state";
import { createDefaultSettings } from "../lib/settings-state";
import { LocalRuntimeSettings } from "./LocalRuntimeSettings";
import { ModeSettings } from "./ModeSettings";
import { ModelRecommendationPanel } from "./ModelRecommendationPanel";
import { ProviderSettings } from "./ProviderSettings";
import { SystemScanPanel } from "./SystemScanPanel";

interface SettingsPanelProps {
  settings: Scroll3DSettings;
  scan: SystemScanResult;
  message: string;
  onSettingsChange: (settings: Scroll3DSettings) => void;
  onScanChange: (scan: SystemScanResult) => void;
  onMessage: (message: string) => void;
}

export function SettingsPanel({
  settings,
  scan,
  message,
  onSettingsChange,
  onScanChange,
  onMessage
}: SettingsPanelProps) {
  return (
    <section className="toolPanel settingsPanel" aria-labelledby="settings-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Settings</p>
          <h2 id="settings-title">Providers and local runtime</h2>
        </div>
        <button
          type="button"
          className="secondaryButton"
          onClick={() => {
            onSettingsChange(createDefaultSettings());
            onMessage("Settings reset to developer-preview defaults.");
          }}
        >
          Reset settings
        </button>
      </div>

      {message ? <p className="statusText">{message}</p> : null}

      <ModeSettings settings={settings} onChange={onSettingsChange} />
      <ProviderSettings
        settings={settings}
        onChange={onSettingsChange}
        onMessage={onMessage}
      />
      <LocalRuntimeSettings
        settings={settings}
        onChange={onSettingsChange}
        onMessage={onMessage}
      />
      <SystemScanPanel scan={scan} onScan={onScanChange} />
      <ModelRecommendationPanel
        settings={settings}
        scan={scan}
        onChange={onSettingsChange}
      />
    </section>
  );
}
