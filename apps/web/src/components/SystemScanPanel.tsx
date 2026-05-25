import { formatSystemSpecs, type SystemScanResult } from "../lib/model-recommendations";
import { createBrowserSystemScan } from "../lib/system-scan-client";

interface SystemScanPanelProps {
  scan: SystemScanResult;
  onScan: (scan: SystemScanResult) => void;
}

export function SystemScanPanel({ scan, onScan }: SystemScanPanelProps) {
  return (
    <section className="editorSection" aria-labelledby="system-scan-title">
      <div className="sectionHeader splitHeader">
        <div>
          <p className="eyebrow">System scan</p>
          <h3 id="system-scan-title">Browser-safe hardware snapshot</h3>
        </div>
        <button
          type="button"
          className="secondaryButton"
          onClick={() => {
            onScan(createBrowserSystemScan());
          }}
        >
          Scan browser
        </button>
      </div>

      <pre className="settingsPre">{formatSystemSpecs(scan.specs)}</pre>
      <ul className="messageList">
        {scan.warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </section>
  );
}
