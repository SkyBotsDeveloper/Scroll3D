import type { ExportResult, StaticExportBundle } from "@scroll3d/exporter/browser";
import { AlertBox } from "./AlertBox";
import { StatusBadge } from "./StatusBadge";

interface SimpleExportPanelProps {
  exportResult: ExportResult;
  bundle: StaticExportBundle | undefined;
  status: string;
  onDownloadZip: () => void;
  onViewFiles: () => void;
}

const expectedFiles = [
  "index.html",
  "styles.css",
  "scroll-engine.js",
  "project.json",
  "frame-manifest.json"
];

export function SimpleExportPanel({
  exportResult,
  bundle,
  status,
  onDownloadZip,
  onViewFiles
}: SimpleExportPanelProps) {
  const paths = new Set(bundle?.files.map((file) => file.path) ?? []);

  return (
    <section className="exportFocusPanel" aria-labelledby="export-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Export</p>
          <h2 id="export-title">Download your website</h2>
          <p className="statusText">
            Self-hostable static website. No backend required.
          </p>
        </div>
        <StatusBadge tone={exportResult.success ? "ok" : "error"}>
          {exportResult.success ? "Ready" : "Not ready"}
        </StatusBadge>
      </div>

      <button
        type="button"
        className="primaryButton downloadHeroButton"
        disabled={!exportResult.success}
        onClick={onDownloadZip}
      >
        Download ZIP
      </button>

      <p className="statusText" aria-live="polite">
        {status}
      </p>

      <div className="exportChecklist" aria-label="Export file checklist">
        {expectedFiles.map((path) => (
          <div key={path}>
            <span className={`statusPill ${paths.has(path) ? "ok" : "neutral"}`}>
              {paths.has(path) ? "Included" : "Planned"}
            </span>
            <strong>{path}</strong>
          </div>
        ))}
      </div>

      {exportResult.warnings.length > 0 ? (
        <AlertBox title="Export notes" tone="warning">
          <ul className="messageList">
            {exportResult.warnings.map((warning) => (
              <li key={`${warning.code}-${warning.message}`}>{warning.message}</li>
            ))}
          </ul>
        </AlertBox>
      ) : null}

      <button type="button" className="secondaryButton" onClick={onViewFiles}>
        View files in Advanced
      </button>
    </section>
  );
}
