import type { ExportResult } from "@scroll3d/exporter/browser";
import { AlertBox } from "./AlertBox";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";

interface ExportPreviewProps {
  exportResult: ExportResult;
  srcDoc: string;
}

export function ExportPreview({ exportResult, srcDoc }: ExportPreviewProps) {
  const bundle = exportResult.bundle;

  return (
    <section className="toolPanel previewPanel" aria-labelledby="preview-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Preview</p>
          <h2 id="preview-title">Static website preview</h2>
          <p className="statusText">
            The iframe is sandboxed for safety while you inspect the generated site.
          </p>
        </div>
        <StatusBadge tone={exportResult.success ? "ok" : "error"}>
          {exportResult.success ? "Export ready" : "Export failed"}
        </StatusBadge>
      </div>

      <div className="metricsGrid">
        <MetricCard label="files" value={bundle?.files.length ?? 0} />
        <MetricCard label="warnings" value={exportResult.warnings.length} />
        <MetricCard label="errors" value={exportResult.errors.length} />
      </div>

      <AlertBox title="Static export" tone="success">
        <p>
          Exported bundles are designed for self-hosting: HTML, CSS, JavaScript, project
          data, and frame manifests without a backend.
        </p>
      </AlertBox>

      {exportResult.errors.length > 0 ? (
        <AlertBox title="Export errors" tone="error">
          <ul className="messageList">
            {exportResult.errors.map((error) => (
              <li key={`${error.code}-${error.message}`}>{error.message}</li>
            ))}
          </ul>
        </AlertBox>
      ) : null}

      <iframe
        title="Scroll3D static export preview"
        className="previewFrame"
        sandbox=""
        srcDoc={srcDoc}
      />
    </section>
  );
}
