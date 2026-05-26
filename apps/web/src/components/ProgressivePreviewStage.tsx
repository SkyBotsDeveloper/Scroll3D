import type { CinematicGenerationPhase } from "../lib/cinematic-generation";

interface ProgressivePreviewStageProps {
  phase: CinematicGenerationPhase;
}

export function ProgressivePreviewStage({ phase }: ProgressivePreviewStageProps) {
  return (
    <div className={`progressivePreviewStage ${phase.id}`}>
      <div className="progressivePreviewAtmosphere" aria-hidden="true" />
      <div className="progressiveCanvas">
        <div className="progressiveHeroBlock">
          <span />
          <strong>{phase.previewLabel}</strong>
          <p>{phase.directorNote}</p>
        </div>

        <div className="progressiveSceneStack" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="progressiveSectionGrid" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="progressiveTimelineHint">
          <span>{String(phase.progress)}%</span>
          <small>Cinematic pass in progress</small>
        </div>
      </div>
    </div>
  );
}
