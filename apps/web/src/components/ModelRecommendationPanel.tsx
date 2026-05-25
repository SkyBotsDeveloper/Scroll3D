import {
  createModelDownloadPlan,
  listModelCatalog,
  listModelPacks,
  recommendModelPack,
  type SystemScanResult
} from "../lib/model-recommendations";
import type { ModelPackPreference, Scroll3DSettings } from "../lib/settings-state";
import { updateSettingsTimestamp } from "../lib/settings-state";

interface ModelRecommendationPanelProps {
  settings: Scroll3DSettings;
  scan: SystemScanResult;
  onChange: (settings: Scroll3DSettings) => void;
}

const preferences: ModelPackPreference[] = [
  "auto",
  "lite",
  "balanced",
  "pro",
  "custom"
];

export function ModelRecommendationPanel({
  settings,
  scan,
  onChange
}: ModelRecommendationPanelProps) {
  const recommendation = recommendModelPack(scan.specs);
  const downloadPlan = createModelDownloadPlan(
    scan.specs,
    settings.modelPackPreference
  );

  return (
    <section className="editorSection" aria-labelledby="model-recommendation-title">
      <div className="sectionHeader">
        <p className="eyebrow">Model manager</p>
        <h3 id="model-recommendation-title">Download planning and model catalog</h3>
        <p className="statusText">
          Generate a safe model plan, estimate resource needs, and keep downloads
          separate from future runtime execution.
        </p>
      </div>

      <label className="field">
        <span>Preferred model pack</span>
        <select
          value={settings.modelPackPreference}
          onChange={(event) => {
            onChange(
              updateSettingsTimestamp({
                ...settings,
                modelPackPreference: event.target.value as ModelPackPreference
              })
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

      <div className="recommendationCard">
        <strong>Recommended: {recommendation.recommendedPack.name}</strong>
        <span>{recommendation.recommendedPack.description}</span>
        <small>
          Estimated disk: {String(recommendation.recommendedPack.estimatedDiskGB)} GB
        </small>
      </div>

      <div className="readonlyGrid compactSummary">
        <div>
          <span>Plan pack</span>
          <strong>{downloadPlan.selectedPack}</strong>
        </div>
        <div>
          <span>Models</span>
          <strong>{String(downloadPlan.summary.entryCount)}</strong>
        </div>
        <div>
          <span>Download size</span>
          <strong>{String(downloadPlan.summary.totalEstimatedDownloadGB)} GB</strong>
        </div>
        <div>
          <span>Disk after install</span>
          <strong>
            {String(downloadPlan.summary.totalEstimatedDiskAfterInstallGB)} GB
          </strong>
        </div>
        <div>
          <span>Unsupported</span>
          <strong>{String(downloadPlan.summary.unsupportedCount)}</strong>
        </div>
        <div>
          <span>Command</span>
          <strong>pnpm runtime:plan-downloads</strong>
        </div>
      </div>

      <div className="modelPackGrid" aria-label="Required model download plan">
        {downloadPlan.entries.map((entry) => (
          <div key={entry.modelId} className="frameSetItem">
            <div className="inlineCluster">
              <strong>{entry.name}</strong>
              <span className={`providerBadge ${entry.status}`}>{entry.status}</span>
            </div>
            <span>
              {entry.stage} - {entry.runtime} - approx {String(entry.estimatedSizeGB)}{" "}
              GB
            </span>
            <small>Action: {entry.action}</small>
            {entry.risks.length ? (
              <div className="riskBadgeList" aria-label={`${entry.name} risks`}>
                {entry.risks.map((risk) => (
                  <span key={risk} className="providerBadge warning">
                    {risk}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="modelPackGrid">
        {listModelPacks().map((pack) => (
          <div key={pack.id} className="frameSetItem">
            <strong>{pack.name}</strong>
            <span>
              RAM {String(pack.minRamGB)}-{String(pack.recommendedRamGB)} GB, disk{" "}
              {String(pack.estimatedDiskGB)} GB
            </span>
            <small>{pack.stagesSupported.join(", ")}</small>
          </div>
        ))}
      </div>

      <div className="modelPackGrid" aria-label="Model catalog summary">
        {listModelCatalog().map((model) => (
          <div key={model.id} className="frameSetItem">
            <strong>{model.name}</strong>
            <span>
              {model.stage} - {model.runtime} - approx {String(model.sizeGB)} GB
            </span>
            <small>{model.status}</small>
          </div>
        ))}
      </div>

      <button type="button" className="secondaryButton" disabled>
        Download models disabled until a later phase
      </button>

      <p className="statusText">
        Command hints: pnpm setup:local, pnpm runtime:plan-downloads, pnpm
        runtime:handshake.
      </p>

      <ul className="messageList">
        {[...recommendation.reasons, ...downloadPlan.warnings].map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </section>
  );
}
