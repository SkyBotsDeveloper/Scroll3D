import type { Scroll3DProject } from "@scroll3d/core";
import {
  sceneTimelineItems,
  type CinematicGenerationPhase
} from "../lib/cinematic-generation";
import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import { CinematicGenerationProgress } from "./CinematicGenerationProgress";
import { StatusBadge } from "./StatusBadge";

interface WorkspaceSidebarProps {
  project: Scroll3DProject;
  prompt: string;
  result: MockPipelineResult | null;
  activePhase: CinematicGenerationPhase;
  activePhaseIndex: number;
  isGenerating: boolean;
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
  activePhase,
  activePhaseIndex,
  isGenerating,
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
            <span className="miniBadge">
              {isGenerating ? activePhase.shortLabel : (result?.status ?? "ready")}
            </span>
          </div>
          <CinematicGenerationProgress
            activePhase={activePhase}
            activeIndex={activePhaseIndex}
            isGenerating={isGenerating}
          />
        </section>

        <section className="sidebarSection">
          <div className="sidebarSectionHeader">
            <span className="eyebrow">Scene timeline</span>
            <span className="miniBadge">{String(project.pages.length)} page</span>
          </div>
          <div className="sceneTimelineList" aria-label="Cinematic scene timeline">
            {sceneTimelineItems.map((scene) => (
              <article key={scene.id} className="sceneTimelineItem">
                <span className="sceneThumbnail" aria-hidden="true" />
                <div>
                  <strong>
                    {String(scene.order)}. {scene.label}
                  </strong>
                  <small>{scene.transitionHint}</small>
                  <p>{scene.motionHint}</p>
                </div>
              </article>
            ))}
          </div>
          <details className="sidebarDetails">
            <summary>Project sections</summary>
            <nav className="sidebarNav" aria-label="Project sections">
              {project.pages[0]?.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  <span>{section.name}</span>
                  <small>{section.type}</small>
                </a>
              ))}
            </nav>
          </details>
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
