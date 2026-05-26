import {
  listProviderPluginManifests,
  type ProviderPluginManifest,
  type ProviderPluginMode
} from "@scroll3d/providers";
import { resolveProviderStatuses } from "../lib/provider-preferences";
import type { Scroll3DSettings } from "../lib/settings-state";
import { ModeSettings } from "./ModeSettings";
import { ProviderSettings } from "./ProviderSettings";

interface ProviderSetupPanelProps {
  settings: Scroll3DSettings;
  onChange: (settings: Scroll3DSettings) => void;
  onMessage: (message: string) => void;
}

const modeLabels: Record<ProviderPluginMode, string> = {
  mock: "Mock",
  local: "Local",
  api: "API"
};

const modeDescriptions: Record<ProviderPluginMode, string> = {
  mock: "Safe offline defaults for developer preview.",
  local: "Future machine-local models and tools.",
  api: "Future bring-your-own-key provider connections."
};

const capabilityTypes = [
  { id: "llm", label: "Prompt planning" },
  { id: "image", label: "Image concept" },
  { id: "video", label: "Motion planning" },
  { id: "frame", label: "Scroll frames" },
  { id: "code", label: "Website compile" }
] as const;

export function ProviderSetupPanel({
  settings,
  onChange,
  onMessage
}: ProviderSetupPanelProps) {
  const manifests = listProviderPluginManifests();
  const statuses = resolveProviderStatuses(settings);
  const modes: ProviderPluginMode[] = ["mock", "api", "local"];

  return (
    <section className="providerSetupPanel" aria-labelledby="provider-setup-title">
      <div className="sectionHeader">
        <p className="eyebrow">Provider setup</p>
        <h3 id="provider-setup-title">Choose how Scroll3D will generate</h3>
        <p className="statusText">
          Provider cards describe future integrations without making real network calls
          or running local models. Mock providers remain the safe default.
        </p>
      </div>

      <div className="providerOverviewGrid" aria-label="Provider mode overview">
        {modes.map((mode) => {
          const count = manifests.filter((manifest) => manifest.mode === mode).length;

          return (
            <div key={mode} className={`providerModeCard ${mode}`}>
              <span className={`providerBadge ${mode}`}>{modeLabels[mode]}</span>
              <strong>{String(count)} provider manifests</strong>
              <small>{modeDescriptions[mode]}</small>
            </div>
          );
        })}
      </div>

      <div className="secretRefHelp" aria-labelledby="secret-ref-title">
        <div>
          <p className="eyebrow">SecretRef safety</p>
          <h4 id="secret-ref-title">Reference secrets, never paste keys here</h4>
          <p>
            API providers should point to a secret id such as <code>openai.main</code>{" "}
            or <code>replicate.primary</code>. Raw keys stay outside project files,
            exports, logs, and generated websites.
          </p>
        </div>
        <div className="secretRefExamples">
          <span>openai.main</span>
          <span>replicate.primary</span>
          <span>comfy.remote</span>
        </div>
      </div>

      <div className="providerDecisionGrid" aria-label="Current stage decisions">
        {statuses.map((status) => (
          <div key={status.stage} className="providerDecisionCard">
            <div className="inlineCluster">
              <strong>{status.label}</strong>
              <span className={`providerBadge ${status.status}`}>{status.status}</span>
            </div>
            <span>{status.providerLabel}</span>
            <small>{status.explanation}</small>
          </div>
        ))}
      </div>

      <section className="providerManifestGroup" aria-labelledby="capability-groups">
        <div className="sectionHeader">
          <h4 id="capability-groups">Capabilities</h4>
          <p className="statusText">
            Each pipeline stage can be backed by mock, API, or local providers later.
          </p>
        </div>
        <div className="providerDecisionGrid">
          {capabilityTypes.map((capabilityType) => {
            const matchingManifests = manifests.filter((manifest) =>
              manifest.capabilities.some(
                (capability) => capability.providerType === capabilityType.id
              )
            );

            return (
              <div key={capabilityType.id} className="providerDecisionCard">
                <div className="inlineCluster">
                  <strong>{capabilityType.label}</strong>
                  <span className="providerBadge configured">
                    {String(matchingManifests.length)}
                  </span>
                </div>
                <small>
                  {matchingManifests.map((manifest) => manifest.displayName).join(", ")}
                </small>
              </div>
            );
          })}
        </div>
      </section>

      {modes.map((mode) => (
        <section
          key={mode}
          className="providerManifestGroup"
          aria-labelledby={`provider-group-${mode}`}
        >
          <div className="sectionHeader">
            <h4 id={`provider-group-${mode}`}>{modeLabels[mode]} providers</h4>
            <p className="statusText">{modeDescriptions[mode]}</p>
          </div>
          <div className="providerManifestGrid">
            {manifests
              .filter((manifest) => manifest.mode === mode)
              .map((manifest) => (
                <ProviderManifestCard key={manifest.providerId} manifest={manifest} />
              ))}
          </div>
        </section>
      ))}

      <details className="advancedConfigDetails">
        <summary>
          <span>
            <strong>Mode and stage preferences</strong>
            <small>Advanced controls for API, Local, Hybrid, and Mock setup</small>
          </span>
        </summary>
        <ModeSettings settings={settings} onChange={onChange} />
        <ProviderSettings
          settings={settings}
          onChange={onChange}
          onMessage={onMessage}
        />
      </details>
    </section>
  );
}

function ProviderManifestCard({ manifest }: { manifest: ProviderPluginManifest }) {
  return (
    <article className="providerManifestCard">
      <div className="providerManifestHeader">
        <div>
          <span className={`providerBadge ${manifest.mode}`}>
            {modeLabels[manifest.mode]}
          </span>
          <h4>{manifest.displayName}</h4>
        </div>
        <span className="miniBadge">v{manifest.version}</span>
      </div>
      <p>{manifest.description}</p>
      <div
        className="providerCapabilityList"
        aria-label={`${manifest.displayName} capabilities`}
      >
        {manifest.capabilities.map((capability) => (
          <span key={`${manifest.providerId}-${capability.id}`}>
            {capability.label}
          </span>
        ))}
      </div>
      <div className="readonlyGrid compactSummary">
        <div>
          <span>Network</span>
          <strong>
            {manifest.runtimeRequirements.requiresNetwork ? "required" : "offline"}
          </strong>
        </div>
        <div>
          <span>SecretRef</span>
          <strong>
            {manifest.runtimeRequirements.requiresSecretRef ? "required" : "none"}
          </strong>
        </div>
        <div>
          <span>Runtime</span>
          <strong>
            {manifest.runtimeRequirements.requiresLocalRuntime ? "local" : "not needed"}
          </strong>
        </div>
      </div>
      <details className="setupInstructionsDetails">
        <summary>Setup guidance</summary>
        <p>{manifest.setupInstructions.summary}</p>
        <ol>
          {manifest.setupInstructions.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>
    </article>
  );
}
