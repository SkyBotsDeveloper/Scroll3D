import type { ProjectValidationResult } from "../lib/validation";

interface CompactStatusBarProps {
  validation: ProjectValidationResult;
  fileCount: number;
  status: string;
}

export function CompactStatusBar({
  validation,
  fileCount,
  status
}: CompactStatusBarProps) {
  return (
    <section className="compactStatusBar" aria-label="Project and export status">
      <span className={`statusPill ${validation.ok ? "ok" : "error"}`}>
        {validation.ok ? "Valid project" : "Needs fixes"}
      </span>
      <span className="statusPill accent">{String(fileCount)} export files</span>
      <span className="statusPill warning">Mock frames referenced</span>
      <p aria-live="polite">{status}</p>
    </section>
  );
}
