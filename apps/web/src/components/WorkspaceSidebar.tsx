import type { Scroll3DProject } from "@scroll3d/core";
import { type CinematicGenerationPhase } from "../lib/cinematic-generation";
import type { MockPipelineResult } from "../lib/mock-pipeline-client";
import {
  getMotionPreset,
  getNarrativeRole,
  getProjectScenes
} from "../lib/scene-metadata";
import { CinematicGenerationProgress } from "./CinematicGenerationProgress";
import { StatusBadge } from "./StatusBadge";

interface WorkspaceSidebarProps {
  project: Scroll3DProject;
  prompt: string;
  result: MockPipelineResult | null;
  activePhase: CinematicGenerationPhase;
  activePhaseIndex: number;
  isGenerating: boolean;
  selectedSceneId: string;
  collapsed: boolean;
  focusMode: boolean;
  onToggle: () => void;
  onSelectScene: (sceneId: string) => void;
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
  selectedSceneId,
  collapsed,
  focusMode,
  onToggle,
  onSelectScene,
  onRegenerate,
  onNewProject,
  onOpenSettings
}: WorkspaceSidebarProps) {
  const scenes = getProjectScenes(project);

  return (
    <aside
      className={[
        "workspaceSidebar",
        collapsed ? "collapsed" : "",
        focusMode ? "focusMode" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Workspace navigation"
    >
      <div className="sidebarRail" aria-label="Compact workspace rail">
        <button
          type="button"
          className="sidebarRailButton sidebarToggleButton"
          aria-label={
            collapsed ? "Expand workspace sidebar" : "Collapse workspace sidebar"
          }
          onClick={onToggle}
        >
          {collapsed ? ">" : "<"}
        </button>
        <button
          type="button"
          className="sidebarRailButton active"
          onClick={onToggle}
          aria-label="Open prompt and scene workspace"
        >
          P
        </button>
        <button
          type="button"
          className="sidebarRailButton"
          onClick={onRegenerate}
          aria-label="Regenerate website draft"
        >
          G
        </button>
        <span className="sidebarRailDivider" aria-hidden="true" />
        <button
          type="button"
          className="sidebarRailButton"
          onClick={onOpenSettings}
          aria-label="Open Control Center"
        >
          C
        </button>
      </div>

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
            <span className="eyebrow">Direction</span>
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
            <span className="miniBadge">{String(scenes.length)} scenes</span>
          </div>
          <div className="sceneTimelineList" aria-label="Cinematic scene timeline">
            {scenes.map((scene) => {
              const motion = getMotionPreset(scene.metadata.motionPreset);
              const role = getNarrativeRole(scene.metadata.narrativeRole);

              return (
                <button
                  key={scene.id}
                  type="button"
                  className={
                    scene.id === selectedSceneId
                      ? "sceneTimelineItem active"
                      : "sceneTimelineItem"
                  }
                  onClick={() => {
                    onSelectScene(scene.id);
                  }}
                >
                  <span className="sceneThumbnail" aria-hidden="true" />
                  <div>
                    <strong>
                      {String(scene.order + 1)}. {scene.metadata.title}
                    </strong>
                    <small>{role?.label ?? scene.metadata.narrativeRole}</small>
                    <p>{motion?.label ?? scene.metadata.motionPreset}</p>
                  </div>
                </button>
              );
            })}
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
            Control center
          </button>
        </section>
      </div>
    </aside>
  );
}
