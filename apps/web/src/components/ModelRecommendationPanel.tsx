import {
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

  return (
    <section className="editorSection" aria-labelledby="model-recommendation-title">
      <div className="sectionHeader">
        <p className="eyebrow">Model packs</p>
        <h3 id="model-recommendation-title">Recommendation foundation</h3>
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

      <ul className="messageList">
        {recommendation.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </section>
  );
}
