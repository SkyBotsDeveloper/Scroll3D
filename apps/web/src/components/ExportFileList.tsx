import type { StaticExportBundle } from "@scroll3d/exporter/browser";
import type { FilePreview } from "../lib/export-client";

interface ExportFileListProps {
  bundle: StaticExportBundle | undefined;
  selectedPath: string;
  preview: FilePreview | undefined;
  onSelect: (path: string) => void;
}

export function ExportFileList({
  bundle,
  selectedPath,
  preview,
  onSelect
}: ExportFileListProps) {
  return (
    <section className="toolPanel filePanel" aria-labelledby="file-list-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Bundle files</p>
          <h2 id="file-list-title">Generated output</h2>
        </div>
      </div>

      <div className="fileWorkspace">
        <div className="fileList" role="list" aria-label="Generated export files">
          {bundle?.files.map((file) => (
            <button
              key={file.path}
              type="button"
              className={file.path === selectedPath ? "fileItem active" : "fileItem"}
              onClick={() => {
                onSelect(file.path);
              }}
            >
              <span>{file.path}</span>
              <small>
                {file.mimeType} · {file.size ?? file.content.length} B
              </small>
            </button>
          )) ?? <p className="emptyState">No export files available.</p>}
        </div>

        <div className="filePreview" aria-live="polite">
          {preview ? (
            <>
              <div className="filePreviewMeta">
                <strong>{preview.path}</strong>
                <span>
                  {preview.mimeType} · {preview.size} B
                </span>
              </div>
              <pre>{preview.text}</pre>
              {preview.truncated ? (
                <p className="previewNote">Preview truncated for readability.</p>
              ) : null}
            </>
          ) : (
            <p className="emptyState">Select a generated text file to inspect it.</p>
          )}
        </div>
      </div>
    </section>
  );
}
