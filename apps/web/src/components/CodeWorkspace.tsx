import type { StaticExportBundle } from "@scroll3d/exporter/browser";
import type { FilePreview } from "../lib/export-client";
import { StatusBadge } from "./StatusBadge";

interface CodeWorkspaceProps {
  bundle: StaticExportBundle | undefined;
  selectedPath: string;
  preview: FilePreview | undefined;
  onSelectFile: (path: string) => void;
}

export function CodeWorkspace({
  bundle,
  selectedPath,
  preview,
  onSelectFile
}: CodeWorkspaceProps) {
  const files = bundle?.files ?? [];

  return (
    <section className="codeWorkspace" aria-labelledby="code-workspace-title">
      <div className="codeWorkspaceTopbar">
        <div>
          <p className="eyebrow">Code</p>
          <h2 id="code-workspace-title">Generated website files</h2>
        </div>
        <div className="inlineCluster">
          <StatusBadge tone="accent">Static export</StatusBadge>
          <span className="miniBadge">Editor foundation</span>
        </div>
      </div>

      <div className="codeEditorShell">
        <aside className="codeFileExplorer" aria-label="Generated file explorer">
          <div className="codePanelHeader">
            <strong>Files</strong>
            <span>{String(files.length)}</span>
          </div>
          <div className="fileList">
            {files.map((file) => (
              <button
                key={file.path}
                type="button"
                className={file.path === selectedPath ? "fileItem active" : "fileItem"}
                onClick={() => {
                  onSelectFile(file.path);
                }}
              >
                <span>{file.path}</span>
                <small>
                  {file.mimeType} - {file.size ?? file.content.length} B
                </small>
              </button>
            ))}
            {files.length === 0 ? (
              <p className="emptyState">Generate a website to inspect files.</p>
            ) : null}
          </div>
        </aside>

        <div className="codeEditorPanel">
          <div className="codeTabs">
            <button type="button" className="tabButton active">
              {preview?.path ?? "No file selected"}
            </button>
            <button type="button" className="tabButton" disabled>
              Live edit later
            </button>
          </div>

          <div className="codeEditorBody" aria-live="polite">
            {preview ? (
              <>
                <div className="filePreviewMeta">
                  <strong>{preview.path}</strong>
                  <span>
                    {preview.mimeType} - {preview.size} B
                  </span>
                </div>
                <pre>{preview.text}</pre>
                {preview.truncated ? (
                  <p className="previewNote">Preview truncated for readability.</p>
                ) : null}
              </>
            ) : (
              <div className="previewEmptyState">
                <strong>Select a generated file.</strong>
                <span>
                  This code workspace is prepared for future Monaco-style editing and
                  live file panels.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
