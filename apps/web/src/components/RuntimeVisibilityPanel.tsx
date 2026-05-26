import {
  checkLocalRuntimeStatus,
  createOfflineRuntimeHandshakeDisplay,
  formatRuntimeStatus
} from "../lib/runtime-status";
import { updateSettingsTimestamp, type Scroll3DSettings } from "../lib/settings-state";
import { LocalRuntimeSettings } from "./LocalRuntimeSettings";

interface RuntimeVisibilityPanelProps {
  settings: Scroll3DSettings;
  onChange: (settings: Scroll3DSettings) => void;
  onMessage: (message: string) => void;
}

export function RuntimeVisibilityPanel({
  settings,
  onChange,
  onMessage
}: RuntimeVisibilityPanelProps) {
  const runtime = settings.localRuntime;
  const handshake = createOfflineRuntimeHandshakeDisplay(runtime);

  return (
    <section
      className="runtimeVisibilityPanel"
      aria-labelledby="runtime-visibility-title"
    >
      <div className="sectionHeader">
        <p className="eyebrow">Runtime visibility</p>
        <h3 id="runtime-visibility-title">Offline runtime status</h3>
        <p className="statusText">
          Scroll3D is running in mocked/offline mode. Local model execution is planned
          but disabled until a later phase.
        </p>
      </div>

      <div className="runtimeStatusGrid">
        <div className="runtimeStatusCard">
          <span>Status</span>
          <strong>{formatRuntimeStatus(runtime.status)}</strong>
          <small>Connection checks are placeholders.</small>
        </div>
        <div className="runtimeStatusCard">
          <span>Handshake</span>
          <strong>{handshake.status}</strong>
          <small>No runtime server was contacted.</small>
        </div>
        <div className="runtimeStatusCard">
          <span>Heavy jobs</span>
          <strong>{String(handshake.maxConcurrentHeavyJobs)}</strong>
          <small>One heavy model at a time.</small>
        </div>
        <div className="runtimeStatusCard">
          <span>Models ready</span>
          <strong>{String(runtime.installedModels.length)}</strong>
          <small>Downloads are not enabled.</small>
        </div>
      </div>

      <div className="runtimeLifecycleCard">
        <strong>Future local generation flow</strong>
        <ol className="setupSteps">
          <li>Plan setup with pnpm setup:local.</li>
          <li>Install models later through an explicit download command.</li>
          <li>Start the local runtime and connect from Settings.</li>
          <li>Load one required model, run one stage, unload, then continue.</li>
        </ol>
      </div>

      <div className="consumerActionRow">
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
          Check placeholder
        </button>
        <span className="statusText">No models are downloaded or executed.</span>
      </div>

      <details className="advancedConfigDetails">
        <summary>
          <span>
            <strong>Runtime configuration details</strong>
            <small>
              URLs, local paths, setup commands, and offline handshake notes
            </small>
          </span>
        </summary>
        <LocalRuntimeSettings
          settings={settings}
          onChange={onChange}
          onMessage={onMessage}
        />
      </details>
    </section>
  );
}
