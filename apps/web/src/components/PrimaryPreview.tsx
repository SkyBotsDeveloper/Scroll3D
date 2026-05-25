import type { ExportResult, StaticExportBundle } from "@scroll3d/exporter/browser";
import { AlertBox } from "./AlertBox";
import { StatusBadge } from "./StatusBadge";

interface PrimaryPreviewProps {
  exportResult: ExportResult;
  bundle: StaticExportBundle | undefined;
  srcDoc: string;
  projectName: string;
  hasGenerated: boolean;
  onViewFiles: () => void;
}

export function PrimaryPreview({
  exportResult,
  bundle,
  srcDoc,
  projectName,
  hasGenerated,
  onViewFiles
}: PrimaryPreviewProps) {
  return (
    <section className="primaryPreview" aria-labelledby="primary-preview-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Preview</p>
          <h2 id="primary-preview-title">Live website preview</h2>
          <p className="statusText">
            The generated website appears here as a sandboxed static preview.
          </p>
        </div>
        <StatusBadge tone={hasGenerated && exportResult.success ? "ok" : "neutral"}>
          {hasGenerated && exportResult.success ? "Export ready" : "Waiting"}
        </StatusBadge>
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
            <span className="miniBadge">{hasGenerated ? "Mock preview" : "Empty"}</span>
            <span className={exportResult.success ? "miniBadge ok" : "miniBadge muted"}>
              {exportResult.success ? "Ready" : "Needs attention"}
            </span>
          </div>
        </div>

        <div className="previewViewport">
          {hasGenerated ? (
            <iframe
              title="Scroll3D generated website preview"
              className="previewFrame consumerPreviewFrame"
              sandbox=""
              srcDoc={srcDoc}
            />
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
        <span>{hasGenerated ? "Valid project" : "Prompt first"}</span>
        <span>{hasGenerated ? "Export ready" : "Generate to preview"}</span>
        <span>
          {String(hasGenerated ? (bundle?.files.length ?? 0) : 0)} generated files
        </span>
        <button type="button" className="secondaryButton" onClick={onViewFiles}>
          View generated files
        </button>
      </div>
    </section>
  );
}
