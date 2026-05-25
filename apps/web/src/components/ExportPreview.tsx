import type { ExportResult } from "@scroll3d/exporter/browser";

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
          <p className="eyebrow">Static export</p>
          <h2 id="preview-title">Sandbox preview</h2>
        </div>
        <div className={exportResult.success ? "statusPill ok" : "statusPill error"}>
          {exportResult.success ? "Export ready" : "Export failed"}
        </div>
      </div>

      <div className="metricsGrid">
        <div>
          <span>{bundle?.files.length ?? 0}</span>
          <small>files</small>
        </div>
        <div>
          <span>{exportResult.warnings.length}</span>
          <small>warnings</small>
        </div>
        <div>
          <span>{exportResult.errors.length}</span>
          <small>errors</small>
        </div>
      </div>

      {exportResult.errors.length > 0 ? (
        <ul className="messageList">
          {exportResult.errors.map((error) => (
            <li key={`${error.code}-${error.message}`}>{error.message}</li>
          ))}
        </ul>
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
