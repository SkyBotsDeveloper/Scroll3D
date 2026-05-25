import {
  checkLocalRuntimeStatus,
  createOfflineRuntimeHandshakeDisplay,
  formatRuntimeStatus
} from "../lib/runtime-status";
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
  const handshake = createOfflineRuntimeHandshakeDisplay(runtime);

  return (
    <section className="editorSection" aria-labelledby="runtime-settings-title">
      <div className="sectionHeader">
        <p className="eyebrow">Local runtime</p>
        <h3 id="runtime-settings-title">Future local model connection</h3>
        <p className="statusText">
          Local mode will load only the model needed for the current stage and run one
          heavy model job at a time.
        </p>
      </div>

      <ol className="setupSteps" aria-label="Future local runtime setup flow">
        <li>Stop the web server.</li>
        <li>Run pnpm setup:local.</li>
        <li>Inspect model requirements with pnpm runtime:plan-downloads.</li>
        <li>Restart with pnpm dev.</li>
        <li>Check runtime guidance with pnpm runtime:handshake.</li>
        <li>Future prompt execution loads, runs, unloads, then advances.</li>
      </ol>

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
        <div>
          <span>Config path</span>
          <strong>.scroll3d/local-runtime.config.json</strong>
        </div>
        <div>
          <span>Selected pack</span>
          <strong>{settings.modelPackPreference}</strong>
        </div>
        <div>
          <span>Model state</span>
          <strong>not installed</strong>
        </div>
        <div>
          <span>Handshake</span>
          <strong>{handshake.status}</strong>
        </div>
        <div>
          <span>Heavy jobs</span>
          <strong>{String(handshake.maxConcurrentHeavyJobs)}</strong>
        </div>
        <div>
          <span>Execution rule</span>
          <strong>one model at a time</strong>
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

      <div className="recommendationCard">
        <div className="inlineCluster">
          <strong>Offline handshake</strong>
          <span className={`providerBadge ${handshake.status}`}>
            {handshake.status}
          </span>
        </div>
        <span>{handshake.summary}</span>
        <small>
          Local execution lifecycle: load required model, run stage, unload model, then
          continue to the next queued stage.
        </small>
      </div>

      <ul className="messageList">
        {handshake.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>

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
