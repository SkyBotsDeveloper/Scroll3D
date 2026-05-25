import type { ProjectValidationResult } from "../lib/validation";

interface JsonSyncPanelProps {
  dirty: boolean;
  validation: ProjectValidationResult;
  visibleSectionCount: number;
  exportedFileCount: number;
}

export function JsonSyncPanel({
  dirty,
  validation,
  visibleSectionCount,
  exportedFileCount
}: JsonSyncPanelProps) {
  return (
    <section className="toolPanel syncPanel" aria-labelledby="json-sync-title">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Sync</p>
          <h2 id="json-sync-title">Project state</h2>
        </div>
      </div>
      <div className="metricsGrid">
        <div>
          <span>{dirty ? "Dirty" : "Synced"}</span>
          <small>JSON state</small>
        </div>
        <div>
          <span>{validation.ok ? "Valid" : "Invalid"}</span>
          <small>schema state</small>
        </div>
        <div>
          <span>{String(visibleSectionCount)}</span>
          <small>visible sections</small>
        </div>
        <div>
          <span>{String(exportedFileCount)}</span>
          <small>export files</small>
        </div>
      </div>
    </section>
  );
}
