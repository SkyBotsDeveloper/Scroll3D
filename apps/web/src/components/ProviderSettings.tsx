import { resolveProviderStatuses } from "../lib/provider-preferences";
import {
  createApiProvider,
  updateSettingsTimestamp,
  type ApiProviderSettings,
  type ApiProviderType,
  type Scroll3DSettings
} from "../lib/settings-state";
import { ApiProviderForm } from "./ApiProviderForm";
import { ProviderStageSelector } from "./ProviderStageSelector";

interface ProviderSettingsProps {
  settings: Scroll3DSettings;
  onChange: (settings: Scroll3DSettings) => void;
  onMessage: (message: string) => void;
}

export function ProviderSettings({
  settings,
  onChange,
  onMessage
}: ProviderSettingsProps) {
  const statuses = resolveProviderStatuses(settings);

  function updateProvider(provider: ApiProviderSettings) {
    onChange(
      updateSettingsTimestamp({
        ...settings,
        apiProviders: settings.apiProviders.map((candidate) =>
          candidate.id === provider.id ? provider : candidate
        )
      })
    );
  }

  function addProvider(type: ApiProviderType) {
    onChange(
      updateSettingsTimestamp({
        ...settings,
        apiProviders: [
          ...settings.apiProviders,
          createApiProvider(type, settings.apiProviders.length + 1)
        ]
      })
    );
  }

  function removeProvider(providerId: string) {
    onChange(
      updateSettingsTimestamp({
        ...settings,
        apiProviders: settings.apiProviders.filter(
          (provider) => provider.id !== providerId
        )
      })
    );
  }

  return (
    <section className="editorSection" aria-labelledby="provider-settings-title">
      <div className="sectionHeader splitHeader">
        <div>
          <p className="eyebrow">Providers</p>
          <h3 id="provider-settings-title">Pipeline stage preferences</h3>
          <p className="statusText">
            Choose Auto, Local, API, or Mock per stage. Secret references are kept
            outside project exports.
          </p>
        </div>
        <button
          type="button"
          className="secondaryButton"
          onClick={() => {
            addProvider("llm");
          }}
        >
          Add API provider
        </button>
      </div>

      <div className="providerStageList">
        {statuses.map((status) => (
          <ProviderStageSelector
            key={status.stage}
            settings={settings}
            status={status}
            onChange={onChange}
          />
        ))}
      </div>

      <div className="apiProviderList">
        {settings.apiProviders.map((provider) => (
          <ApiProviderForm
            key={provider.id}
            provider={provider}
            onChange={updateProvider}
            onRemove={removeProvider}
            onTest={(candidate) => {
              onMessage(
                `${candidate.name || "Provider"} connection test is a placeholder. Real API calls will be enabled in a later phase.`
              );
            }}
          />
        ))}
      </div>
    </section>
  );
}
