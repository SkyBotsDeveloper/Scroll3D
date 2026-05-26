import type { StaticExportBundle } from "@scroll3d/exporter/browser";
import type { Scroll3DProject } from "@scroll3d/core";
import type { FilePreview } from "../lib/export-client";
import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import type { SystemScanResult } from "../lib/model-recommendations";
import type { Scroll3DSettings } from "../lib/settings-state";
import type { ExportHistoryItem } from "../lib/storage";
import type { ProjectValidationResult } from "../lib/validation";
import { ExportActions } from "./ExportActions";
import { ExportFileList } from "./ExportFileList";
import { JsonSyncPanel } from "./JsonSyncPanel";
import { ModelRecommendationPanel } from "./ModelRecommendationPanel";
import { PhaseStatus } from "./PhaseStatus";
import { PipelineRunPanel } from "./PipelineRunPanel";
import { ProviderSetupPanel } from "./ProviderSetupPanel";
import { ProjectJsonEditor } from "./ProjectJsonEditor";
import { RuntimeVisibilityPanel } from "./RuntimeVisibilityPanel";
import { SelfHostingPanel } from "./SelfHostingPanel";
import { SystemScanPanel } from "./SystemScanPanel";
import { VisualEditor } from "./VisualEditor";

export type AdvancedTab =
  | "json"
  | "files"
  | "providers"
  | "models"
  | "runtime"
  | "deploy"
  | "appearance"
  | "diagnostics";

interface AdvancedToolsPanelProps {
  project: Scroll3DProject;
  projectJson: string;
  validation: ProjectValidationResult;
  dirty: boolean;
  visibleSectionCount: number;
  exportedFileCount: number;
  bundle: StaticExportBundle | undefined;
  selectedPath: string;
  filePreview: FilePreview | undefined;
  settings: Scroll3DSettings;
  scan: SystemScanResult;
  settingsMessage: string;
  pipelineResult: MockPipelineResult | null;
  downloadStatus: string;
  history: ExportHistoryItem[];
  exportReady: boolean;
  activeTab: AdvancedTab;
  onTabChange: (tab: AdvancedTab) => void;
  onProjectChange: (project: Scroll3DProject) => void;
  onJsonChange: (value: string) => void;
  onValidate: () => void;
  onApplyJson: () => void;
  onResetProject: () => void;
  onSelectFile: (path: string) => void;
  onSettingsChange: (settings: Scroll3DSettings) => void;
  onScanChange: (scan: SystemScanResult) => void;
  onSettingsMessage: (message: string) => void;
  onApplyPipelineProject: () => void;
  onDownloadZip: () => void;
  onClearStorage: () => void;
}

const tabs: Array<{ id: AdvancedTab; label: string }> = [
  { id: "providers", label: "Providers" },
  { id: "models", label: "Local Models" },
  { id: "runtime", label: "Runtime" },
  { id: "deploy", label: "Self-hosting" },
  { id: "appearance", label: "Appearance" },
  { id: "json", label: "JSON" },
  { id: "files", label: "Generated Files" },
  { id: "diagnostics", label: "Diagnostics" }
];

export function AdvancedToolsPanel({
  project,
  projectJson,
  validation,
  dirty,
  visibleSectionCount,
  exportedFileCount,
  bundle,
  selectedPath,
  filePreview,
  settings,
  scan,
  settingsMessage,
  pipelineResult,
  downloadStatus,
  history,
  exportReady,
  activeTab,
  onTabChange,
  onProjectChange,
  onJsonChange,
  onValidate,
  onApplyJson,
  onResetProject,
  onSelectFile,
  onSettingsChange,
  onScanChange,
  onSettingsMessage,
  onApplyPipelineProject,
  onDownloadZip,
  onClearStorage
}: AdvancedToolsPanelProps) {
  return (
    <section className="advancedPanel" aria-labelledby="advanced-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Advanced</p>
          <h2 id="advanced-title">Global settings center</h2>
          <p className="statusText">
            Configure providers, local models, runtime visibility, self-hosting,
            appearance, JSON, generated files, and diagnostics from one place.
          </p>
        </div>
      </div>

      <div className="advancedTabs" role="tablist" aria-label="Advanced tools">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? "tabButton active" : "tabButton"}
            onClick={() => {
              onTabChange(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "json" ? (
        <ProjectJsonEditor
          value={projectJson}
          validation={validation}
          onChange={onJsonChange}
          onValidate={onValidate}
          onApply={onApplyJson}
          onReset={onResetProject}
        />
      ) : null}

      {activeTab === "files" ? (
        <ExportFileList
          bundle={bundle}
          selectedPath={selectedPath}
          preview={filePreview}
          onSelect={onSelectFile}
        />
      ) : null}

      {activeTab === "providers" ? (
        <section className="toolPanel" aria-label="Provider configuration tools">
          <div className="advancedToolIntro">
            <strong>Providers</strong>
            <span>
              Explore plugin-ready provider manifests, capability groups, SecretRef
              guidance, and stage preferences. Normal mode keeps these details hidden.
            </span>
          </div>
          <ProviderSetupPanel
            settings={settings}
            onChange={onSettingsChange}
            onMessage={onSettingsMessage}
          />
        </section>
      ) : null}

      {activeTab === "models" ? (
        <section className="toolPanel" aria-label="Local model manager tools">
          <div className="advancedToolIntro">
            <strong>Local Models</strong>
            <span>
              Review model packs, planned downloads, and per-stage model readiness.
              Downloads remain disabled until a later phase.
            </span>
          </div>
          <SystemScanPanel scan={scan} onScan={onScanChange} />
          <ModelRecommendationPanel
            settings={settings}
            scan={scan}
            onChange={onSettingsChange}
          />
        </section>
      ) : null}

      {activeTab === "runtime" ? (
        <section className="toolPanel" aria-label="Local runtime tools">
          <div className="advancedToolIntro">
            <strong>Runtime</strong>
            <span>
              Inspect local runtime setup, connection placeholders, and the
              one-model-at-a-time execution plan.
            </span>
          </div>
          <RuntimeVisibilityPanel
            settings={settings}
            onChange={onSettingsChange}
            onMessage={onSettingsMessage}
          />
          {settingsMessage ? (
            <div className="alertBox info">
              <strong>Latest runtime message</strong>
              <p>{settingsMessage}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === "deploy" ? (
        <section className="toolPanel" aria-label="Self-hosting tools">
          <div className="advancedToolIntro">
            <strong>Self-hosting</strong>
            <span>
              Review the static export flow and hosting options. Scroll3D does not
              deploy anything automatically in this phase.
            </span>
          </div>
          <SelfHostingPanel
            bundle={bundle}
            exportReady={exportReady}
            onDownloadZip={onDownloadZip}
          />
        </section>
      ) : null}

      {activeTab === "appearance" ? (
        <section className="toolPanel" aria-label="Appearance tools">
          <div className="advancedToolIntro">
            <strong>Appearance</strong>
            <span>
              Edit project basics, theme, sections, and scroll feel from the full
              structured editor. Normal mode keeps only common controls visible.
            </span>
          </div>
          <VisualEditor project={project} onChange={onProjectChange} />
        </section>
      ) : null}

      {activeTab === "diagnostics" ? (
        <section className="toolPanel diagnosticsPanel" aria-label="Diagnostics">
          <PipelineRunPanel result={pipelineResult} onApply={onApplyPipelineProject} />
          <JsonSyncPanel
            dirty={dirty}
            validation={validation}
            visibleSectionCount={visibleSectionCount}
            exportedFileCount={exportedFileCount}
          />
          <ExportActions
            disabled={!exportReady}
            status={downloadStatus}
            history={history}
            onDownloadZip={onDownloadZip}
            onClearStorage={onClearStorage}
          />
          <div className="recommendationCard">
            <strong>Runtime commands</strong>
            <span>pnpm runtime:scan</span>
            <span>pnpm runtime:doctor</span>
            <span>pnpm runtime:models</span>
            <span>pnpm runtime:plan-downloads</span>
            <span>pnpm runtime:handshake</span>
            <span>pnpm setup:local</span>
          </div>
          <PhaseStatus />
        </section>
      ) : null}
    </section>
  );
}
