import type { ExportResult, StaticExportBundle } from "@scroll3d/exporter/browser";
import { AlertBox } from "./AlertBox";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";

interface PrimaryPreviewProps {
  exportResult: ExportResult;
  bundle: StaticExportBundle | undefined;
  srcDoc: string;
  onViewFiles: () => void;
}

export function PrimaryPreview({
  exportResult,
  bundle,
  srcDoc,
  onViewFiles
}: PrimaryPreviewProps) {
  return (
    <section className="primaryPreview" aria-labelledby="primary-preview-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Preview</p>
          <h2 id="primary-preview-title">Your generated website</h2>
          <p className="statusText">
            Review the exported site safely in a sandboxed preview.
          </p>
        </div>
        <StatusBadge tone={exportResult.success ? "ok" : "error"}>
          {exportResult.success ? "Export ready" : "Needs attention"}
        </StatusBadge>
      </div>

      <div className="previewStatusStrip">
        <MetricCard label="files" value={bundle?.files.length ?? 0} />
        <MetricCard label="warnings" value={exportResult.warnings.length} />
        <MetricCard label="errors" value={exportResult.errors.length} />
      </div>

      {exportResult.errors.length > 0 ? (
        <AlertBox title="Preview needs a valid project" tone="error">
          <ul className="messageList">
            {exportResult.errors.map((error) => (
              <li key={`${error.code}-${error.message}`}>{error.message}</li>
            ))}
          </ul>
        </AlertBox>
      ) : null}

      <iframe
        title="Scroll3D generated website preview"
        className="previewFrame consumerPreviewFrame"
        sandbox=""
        srcDoc={srcDoc}
      />

      <div className="previewFooter">
        <span>Valid project</span>
        <span>Export ready</span>
        <span>Mock scroll scene files referenced</span>
        <button type="button" className="secondaryButton" onClick={onViewFiles}>
          View generated files
        </button>
      </div>
    </section>
  );
}
