import type { ExportHistoryItem } from "../lib/storage";

interface ExportActionsProps {
  disabled: boolean;
  status: string;
  history: ExportHistoryItem[];
  onDownloadZip: () => void;
  onClearStorage: () => void;
}

export function ExportActions({
  disabled,
  status,
  history,
  onDownloadZip,
  onClearStorage
}: ExportActionsProps) {
  return (
    <section className="toolPanel actionsPanel" aria-labelledby="actions-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Local export</p>
          <h2 id="actions-title">Download a self-hostable website</h2>
          <p className="statusText">
            Exported ZIPs include static HTML, CSS, JavaScript, project JSON, and frame
            manifest files. No backend is required.
          </p>
        </div>
        <div className="buttonRow">
          <button
            type="button"
            className="primaryButton"
            onClick={onDownloadZip}
            disabled={disabled}
          >
            Download self-hostable ZIP
          </button>
          <button type="button" className="secondaryButton" onClick={onClearStorage}>
            Clear local data
          </button>
        </div>
      </div>

      <p className="statusText" aria-live="polite">
        {status}
      </p>

      {history.length > 0 ? (
        <div className="historyList">
          <h3>Recent local exports</h3>
          <ul>
            {history.map((item) => (
              <li key={item.id}>
                {item.fileCount} files - {new Date(item.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="emptyState">No ZIP downloads in this browser session yet.</p>
      )}
    </section>
  );
}
