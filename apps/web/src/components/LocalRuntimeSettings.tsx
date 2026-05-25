import { checkLocalRuntimeStatus, formatRuntimeStatus } from "../lib/runtime-status";
import { updateSettingsTimestamp, type Scroll3DSettings } from "../lib/settings-state";

interface LocalRuntimeSettingsProps {
  settings: Scroll3DSettings;
  onChange: (settings: Scroll3DSettings) => void;
  onMessage: (message: string) => void;
}

export function LocalRuntimeSettings({
  settings,
  onChange,
  onMessage
}: LocalRuntimeSettingsProps) {
  const runtime = settings.localRuntime;

  return (
    <section className="editorSection" aria-labelledby="runtime-settings-title">
      <div className="sectionHeader">
        <p className="eyebrow">Local runtime</p>
        <h3 id="runtime-settings-title">Connection foundation</h3>
      </div>

      <div className="readonlyGrid">
        <div>
          <span>Status</span>
          <strong>{formatRuntimeStatus(runtime.status)}</strong>
        </div>
        <div>
          <span>Installed models</span>
          <strong>{String(runtime.installedModels.length)}</strong>
        </div>
        <div>
          <span>Setup command</span>
          <strong>pnpm setup:local</strong>
        </div>
      </div>

      <div className="twoColumnFields">
        <label className="field">
          <span>Runtime URL</span>
          <input
            value={runtime.runtimeUrl}
            onChange={(event) => {
              onChange(
                updateSettingsTimestamp({
                  ...settings,
                  localRuntime: {
                    ...runtime,
                    runtimeUrl: event.target.value
                  }
                })
              );
            }}
          />
        </label>
        <label className="field">
          <span>Config path</span>
          <input
            value={runtime.configPath}
            onChange={(event) => {
              onChange(
                updateSettingsTimestamp({
                  ...settings,
                  localRuntime: {
                    ...runtime,
                    configPath: event.target.value
                  }
                })
              );
            }}
          />
        </label>
      </div>

      <label className="field">
        <span>Model cache path</span>
        <input
          value={runtime.modelCachePath}
          onChange={(event) => {
            onChange(
              updateSettingsTimestamp({
                ...settings,
                localRuntime: {
                  ...runtime,
                  modelCachePath: event.target.value
                }
              })
            );
          }}
        />
      </label>

      <p className="statusText">
        Local runtime will run one heavy model job at a time. This phase does not start
        model servers or download models.
      </p>

      <button
        type="button"
        className="secondaryButton"
        onClick={() => {
          const result = checkLocalRuntimeStatus(runtime);
          onChange(
            updateSettingsTimestamp({
              ...settings,
              localRuntime: {
                ...runtime,
                status: result.status,
                lastCheckedAt: result.checkedAt
              }
            })
          );
          onMessage(result.message);
        }}
      >
        Connect placeholder
      </button>
    </section>
  );
}
