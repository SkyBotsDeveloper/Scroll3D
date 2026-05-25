import type { ApiProviderSettings, ApiProviderType } from "../lib/settings-state";
import { redactSecretValue } from "../lib/secret-redaction";

interface ApiProviderFormProps {
  provider: ApiProviderSettings;
  onChange: (provider: ApiProviderSettings) => void;
  onRemove: (providerId: string) => void;
  onTest: (provider: ApiProviderSettings) => void;
}

const providerTypes: ApiProviderType[] = ["llm", "image", "video", "frame", "code"];

export function ApiProviderForm({
  provider,
  onChange,
  onRemove,
  onTest
}: ApiProviderFormProps) {
  return (
    <article className="apiProviderCard">
      <div className="sectionCardHeader">
        <div>
          <strong>{provider.name || "API provider"}</strong>
          <span>{provider.type} provider - real API calls enabled later</span>
        </div>
        <button
          type="button"
          className="secondaryButton"
          onClick={() => {
            onRemove(provider.id);
          }}
        >
          Remove
        </button>
      </div>

      <div className="twoColumnFields">
        <label className="field">
          <span>Provider name</span>
          <input
            value={provider.name}
            onChange={(event) => {
              onChange({ ...provider, name: event.target.value });
            }}
          />
        </label>
        <label className="field">
          <span>Provider type</span>
          <select
            value={provider.type}
            onChange={(event) => {
              onChange({
                ...provider,
                type: event.target.value as ApiProviderType
              });
            }}
          >
            {providerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Base URL</span>
        <input
          value={provider.baseUrl}
          placeholder="https://api.example.com/v1"
          onChange={(event) => {
            onChange({ ...provider, baseUrl: event.target.value });
          }}
        />
      </label>

      <div className="twoColumnFields">
        <label className="field">
          <span>Model name</span>
          <input
            value={provider.model ?? ""}
            placeholder="model-name"
            onChange={(event) => {
              onChange({ ...provider, model: event.target.value });
            }}
          />
        </label>
        <label className="field">
          <span>Secret reference</span>
          <input
            value={provider.secretRef}
            placeholder="primary-api-key"
            onChange={(event) => {
              onChange({ ...provider, secretRef: event.target.value });
            }}
          />
        </label>
      </div>

      <div className="providerCardFooter">
        <label className="toggleField">
          <input
            type="checkbox"
            checked={provider.enabled}
            onChange={(event) => {
              onChange({ ...provider, enabled: event.target.checked });
            }}
          />
          <span>Enabled</span>
        </label>
        <span>Display ref: {redactSecretValue(provider.secretRef)}</span>
        <button
          type="button"
          className="secondaryButton"
          onClick={() => {
            onTest(provider);
          }}
        >
          Test connection
        </button>
      </div>
    </article>
  );
}
