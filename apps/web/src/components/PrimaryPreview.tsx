import type { ExportResult, StaticExportBundle } from "@scroll3d/exporter/browser";
import {
  getPreviewDeviceWidth,
  type CinematicGenerationPhase,
  type PreviewDevice
} from "../lib/cinematic-generation";
import {
  getMotionPreset,
  getNarrativeRole,
  getTransitionStyle,
  type SceneEditorItem
} from "../lib/scene-metadata";
import { AlertBox } from "./AlertBox";
import { ProgressivePreviewStage } from "./ProgressivePreviewStage";

interface PrimaryPreviewProps {
  exportResult: ExportResult;
  bundle: StaticExportBundle | undefined;
  srcDoc: string;
  projectName: string;
  hasGenerated: boolean;
  isGenerating: boolean;
  generationPhase: CinematicGenerationPhase;
  activeScene: SceneEditorItem | undefined;
  device: PreviewDevice;
  fullscreen: boolean;
  onDeviceChange: (device: PreviewDevice) => void;
  onToggleFullscreen: () => void;
  onViewFiles: () => void;
  onDownloadZip: () => void;
}

export function PrimaryPreview({
  exportResult,
  bundle,
  srcDoc,
  projectName,
  hasGenerated,
  isGenerating,
  generationPhase,
  activeScene,
  device,
  fullscreen,
  onDeviceChange,
  onToggleFullscreen,
  onViewFiles,
  onDownloadZip
}: PrimaryPreviewProps) {
  const motion = activeScene
    ? getMotionPreset(activeScene.metadata.motionPreset)
    : undefined;
  const transition = activeScene
    ? getTransitionStyle(activeScene.metadata.transitionStyle)
    : undefined;
  const role = activeScene
    ? getNarrativeRole(activeScene.metadata.narrativeRole)
    : undefined;

  return (
    <section
      className={fullscreen ? "primaryPreview fullscreenPreview" : "primaryPreview"}
      aria-labelledby="primary-preview-title"
    >
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Cinematic preview</p>
          <h2 id="primary-preview-title">
            {isGenerating ? generationPhase.previewLabel : "Live website preview"}
          </h2>
          <p className="statusText">
            {isGenerating
              ? generationPhase.directorNote
              : "Review your website draft here before editing or exporting."}
          </p>
        </div>
        <div className="previewHeaderActions">
          <span className="previewStateText">
            {isGenerating
              ? "Directing"
              : hasGenerated && exportResult.success
                ? "Draft ready"
                : "Waiting for prompt"}
          </span>
          <button
            type="button"
            className="secondaryButton"
            onClick={onToggleFullscreen}
          >
            {fullscreen ? "Exit focus" : "Enter focus"}
          </button>
        </div>
      </div>

      <div className="previewBrowser" aria-label="Generated website browser frame">
        <div className="previewBrowserBar">
          <div className="windowDots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="previewUrl">{projectName}</span>
          <div className="previewBadges">
            <span className="modeLine">
              {isGenerating ? generationPhase.shortLabel : "Mock preview"}
            </span>
          </div>
        </div>

        <div className="previewDeviceBar" aria-label="Device preview controls">
          {(["desktop", "tablet", "mobile"] as const).map((candidate) => (
            <button
              key={candidate}
              type="button"
              className={
                candidate === device
                  ? "previewDeviceButton active"
                  : "previewDeviceButton"
              }
              onClick={() => {
                onDeviceChange(candidate);
              }}
            >
              {candidate}
            </button>
          ))}
        </div>

        {hasGenerated && activeScene ? (
          <div className="previewSceneFocus" aria-label="Focused scene">
            <span className="miniBadge">Focused scene</span>
            <strong>{activeScene.metadata.title}</strong>
            <span>{role?.label ?? activeScene.metadata.narrativeRole}</span>
            <span>{motion?.label ?? activeScene.metadata.motionPreset}</span>
            <span>{transition?.label ?? activeScene.metadata.transitionStyle}</span>
          </div>
        ) : null}

        <div className="previewViewport">
          {isGenerating ? (
            <ProgressivePreviewStage phase={generationPhase} />
          ) : hasGenerated ? (
            <div
              className={`devicePreviewFrame ${device}`}
              style={{ width: getPreviewDeviceWidth(device) }}
            >
              <iframe
                title="Scroll3D generated website preview"
                className="previewFrame consumerPreviewFrame"
                sandbox=""
                srcDoc={srcDoc}
              />
            </div>
          ) : (
            <div className="previewEmptyState">
              <strong>Your generated 3D website preview will appear here.</strong>
              <span>
                Start with a prompt on the left. Scroll3D will create a website draft
                you can edit and export.
              </span>
            </div>
          )}
        </div>
      </div>

      {hasGenerated && exportResult.errors.length > 0 ? (
        <AlertBox title="Preview needs a valid project" tone="error">
          <ul className="messageList">
            {exportResult.errors.map((error) => (
              <li key={`${error.code}-${error.message}`}>{error.message}</li>
            ))}
          </ul>
        </AlertBox>
      ) : null}

      <div className="previewFooter">
        <span>
          {isGenerating
            ? generationPhase.title
            : hasGenerated
              ? "Website draft ready"
              : "Prompt first"}
        </span>
        <span>
          {isGenerating
            ? "Preview evolving"
            : hasGenerated
              ? "Ready to export"
              : "Generate to preview"}
        </span>
        <span>
          {String(hasGenerated ? (bundle?.files.length ?? 0) : 0)} website files
        </span>
        {hasGenerated && !isGenerating ? (
          <div className="previewFooterActions">
            <button
              type="button"
              className="primaryButton"
              disabled={!exportResult.success}
              onClick={onDownloadZip}
            >
              Download ZIP
            </button>
            <button type="button" className="secondaryButton" onClick={onViewFiles}>
              View files
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
