import type { Scroll3DProject } from "@scroll3d/core";
import type { Scroll3DSettings } from "../lib/settings-state";
import type { ProjectValidationResult } from "../lib/validation";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";

interface EditorToolbarProps {
  project: Scroll3DProject;
  settings: Scroll3DSettings;
  validation: ProjectValidationResult;
  dirty: boolean;
  fileCount: number;
  visibleSectionCount: number;
}

export function EditorToolbar({
  project,
  settings,
  validation,
  dirty,
  fileCount,
  visibleSectionCount
}: EditorToolbarProps) {
  const modeLabel = `${settings.mode[0]?.toUpperCase() ?? ""}${settings.mode.slice(1)} mode`;

  return (
    <header className="editorToolbar" aria-label="Scroll3D dashboard header">
      <nav className="topNav" aria-label="Product">
        <div className="brandLockup">
          <span className="logoMark" aria-hidden="true">
            S3D
          </span>
          <div>
            <strong>Scroll3D</strong>
            <span>Open-source AI 3D website builder</span>
          </div>
        </div>
        <div className="toolbarMeta" aria-label="Project metadata">
          <StatusBadge tone="accent">Developer Preview</StatusBadge>
          <StatusBadge tone="neutral">{modeLabel}</StatusBadge>
          <StatusBadge tone={settings.allowMockFallback ? "warning" : "neutral"}>
            {settings.allowMockFallback ? "Mock fallback on" : "Configured providers"}
          </StatusBadge>
        </div>
      </nav>

      <section className="heroPanel" aria-label="Project overview">
        <div className="heroCopy">
          <p className="eyebrow">Prompt-first cinematic websites</p>
          <h1>Generate, edit, preview, and export a Scroll3D site locally.</h1>
          <p className="subtitle">
            Start with a prompt, run the mock pipeline, adjust the visual project,
            inspect the generated files, and download a self-hostable ZIP.
          </p>
          <p className="projectSubtitle">Current project: {project.name}</p>
        </div>
        <div className="heroStats" aria-label="Current project status">
          <MetricCard
            label="schema"
            value={validation.ok ? "Valid" : "Needs fix"}
            detail={dirty ? "JSON edits are pending" : "Visual and JSON are synced"}
          />
          <MetricCard
            label="sections"
            value={visibleSectionCount}
            detail="visible in export"
          />
          <MetricCard label="files" value={fileCount} detail="static bundle" />
        </div>
        <div className="creditLine" aria-label="Creator credits">
          <span>Creator: Siddhartha Abhimanyu</span>
          <span>Telegram: @iflexelite</span>
          <span>Instagram: elite.sid</span>
        </div>
      </section>
    </header>
  );
}
