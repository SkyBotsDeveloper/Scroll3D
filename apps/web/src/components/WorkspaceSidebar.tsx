import type { Scroll3DProject } from "@scroll3d/core";
import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import { PipelineProgressSimple } from "./PipelineProgressSimple";
import { StatusBadge } from "./StatusBadge";

interface WorkspaceSidebarProps {
  project: Scroll3DProject;
  prompt: string;
  result: MockPipelineResult | null;
  collapsed: boolean;
  onToggle: () => void;
  onRegenerate: () => void;
  onNewProject: () => void;
  onOpenSettings: () => void;
}

export function WorkspaceSidebar({
  project,
  prompt,
  result,
  collapsed,
  onToggle,
  onRegenerate,
  onNewProject,
  onOpenSettings
}: WorkspaceSidebarProps) {
  return (
    <aside
      className={collapsed ? "workspaceSidebar collapsed" : "workspaceSidebar"}
      aria-label="Workspace navigation"
    >
      <button
        type="button"
        className="sidebarToggle"
        aria-label={
          collapsed ? "Expand workspace sidebar" : "Collapse workspace sidebar"
        }
        onClick={onToggle}
      >
        {collapsed ? ">" : "<"}
      </button>

      <div className="sidebarExpandedContent">
        <section className="sidebarSection">
          <div className="sidebarSectionHeader">
            <span className="eyebrow">Prompt</span>
            <StatusBadge tone="warning">Mock</StatusBadge>
          </div>
          <p className="sidebarPrompt">{prompt}</p>
          <div className="buttonRow compactActionRow">
            <button type="button" className="primaryButton" onClick={onRegenerate}>
              Regenerate
            </button>
            <button type="button" className="secondaryButton" onClick={onNewProject}>
              New
            </button>
          </div>
        </section>

        <section className="sidebarSection">
          <div className="sidebarSectionHeader">
            <span className="eyebrow">Build</span>
            <span className="miniBadge">{result?.status ?? "ready"}</span>
          </div>
          <PipelineProgressSimple result={result} />
        </section>

        <section className="sidebarSection">
          <div className="sidebarSectionHeader">
            <span className="eyebrow">Scenes</span>
            <span className="miniBadge">{String(project.pages.length)} page</span>
          </div>
          <nav className="sidebarNav" aria-label="Project sections">
            {project.pages[0]?.sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                <span>{section.name}</span>
                <small>{section.type}</small>
              </a>
            ))}
          </nav>
        </section>

        <section className="sidebarSection">
          <div className="sidebarSectionHeader">
            <span className="eyebrow">Assets</span>
            <span className="miniBadge">{String(project.assets.length)}</span>
          </div>
          <div className="sidebarPlaceholder">
            Asset history, frame sets, and generated media will appear here later.
          </div>
        </section>

        <section className="sidebarSection">
          <div className="sidebarSectionHeader">
            <span className="eyebrow">History</span>
            <span className="miniBadge">local</span>
          </div>
          <div className="sidebarPlaceholder">
            Prompt versions and regeneration checkpoints are planned for a later phase.
          </div>
          <button type="button" className="secondaryButton" onClick={onOpenSettings}>
            Workspace settings
          </button>
        </section>
      </div>
    </aside>
  );
}
