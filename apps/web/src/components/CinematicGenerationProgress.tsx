import {
  cinematicGenerationPhases,
  getCompletedGenerationPhases,
  type CinematicGenerationPhase
} from "../lib/cinematic-generation";
import { StatusBadge } from "./StatusBadge";

interface CinematicGenerationProgressProps {
  activePhase: CinematicGenerationPhase;
  activeIndex: number;
  isGenerating: boolean;
}

export function CinematicGenerationProgress({
  activePhase,
  activeIndex,
  isGenerating
}: CinematicGenerationProgressProps) {
  const completed = new Set(getCompletedGenerationPhases(activeIndex, isGenerating));

  return (
    <section className="directorProgressCard" aria-label="Cinematic generation">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">AI director</p>
          <h2>{isGenerating ? activePhase.title : "Website draft ready"}</h2>
          <p className="statusText">{activePhase.directorNote}</p>
        </div>
        <StatusBadge tone={isGenerating ? "warning" : "ok"}>
          {isGenerating ? "Directing" : "Ready"}
        </StatusBadge>
      </div>

      <div className="directorProgressTrack" aria-hidden="true">
        <span style={{ width: `${String(activePhase.progress)}%` }} />
      </div>

      <div className="directorPhaseList">
        {cinematicGenerationPhases.map((phase, index) => {
          const status = completed.has(phase.id)
            ? "completed"
            : index === activeIndex
              ? "running"
              : "pending";

          return (
            <article key={phase.id} className={`directorPhaseItem ${status}`}>
              <span className="workflowStepNumber">{String(index + 1)}</span>
              <div>
                <strong>{phase.shortLabel}</strong>
                <small>{phase.previewLabel}</small>
              </div>
              <span className={`providerBadge ${status}`}>{status}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
