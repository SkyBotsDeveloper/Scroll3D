export type CinematicGenerationPhaseId =
  | "brief"
  | "structure"
  | "content"
  | "motion"
  | "final";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

export interface CinematicGenerationPhase {
  id: CinematicGenerationPhaseId;
  title: string;
  shortLabel: string;
  directorNote: string;
  previewLabel: string;
  progress: number;
  delayMs: number;
}

export interface SceneTimelineItem {
  id: string;
  label: string;
  order: number;
  transitionHint: string;
  motionHint: string;
}

export const cinematicGenerationPhases: CinematicGenerationPhase[] = [
  {
    id: "brief",
    title: "Reading the creative brief",
    shortLabel: "Brief",
    directorNote: "Finding the audience, mood, and first cinematic hook.",
    previewLabel: "Composing the initial canvas",
    progress: 12,
    delayMs: 250
  },
  {
    id: "structure",
    title: "Blocking the website structure",
    shortLabel: "Structure",
    directorNote: "Laying out hero, story beats, sections, and scroll rhythm.",
    previewLabel: "Layout skeleton emerging",
    progress: 34,
    delayMs: 800
  },
  {
    id: "content",
    title: "Writing the scene copy",
    shortLabel: "Content",
    directorNote: "Shaping headlines, feature moments, pricing, and FAQ flow.",
    previewLabel: "Content layers appearing",
    progress: 58,
    delayMs: 1400
  },
  {
    id: "motion",
    title: "Directing cinematic motion",
    shortLabel: "Motion",
    directorNote: "Planning frame depth, scroll pacing, and transition emphasis.",
    previewLabel: "Scroll scene activating",
    progress: 78,
    delayMs: 2000
  },
  {
    id: "final",
    title: "Polishing the export draft",
    shortLabel: "Polish",
    directorNote: "Checking static files, responsive framing, and export readiness.",
    previewLabel: "Final cinematic pass",
    progress: 100,
    delayMs: 2600
  }
];

export const sceneTimelineItems: SceneTimelineItem[] = [
  {
    id: "hero",
    label: "Opening reveal",
    order: 1,
    transitionHint: "slow push-in",
    motionHint: "Hero copy rises over the scroll canvas."
  },
  {
    id: "features",
    label: "Feature orbit",
    order: 2,
    transitionHint: "depth shift",
    motionHint: "Feature cards enter as the frame sequence advances."
  },
  {
    id: "pricing",
    label: "Decision frame",
    order: 3,
    transitionHint: "hold and brighten",
    motionHint: "Pricing anchors the scroll before the final CTA."
  },
  {
    id: "faq",
    label: "Soft landing",
    order: 4,
    transitionHint: "ease out",
    motionHint: "FAQ and closing details settle the experience."
  }
];

export function getCinematicGenerationPhase(index: number): CinematicGenerationPhase {
  const clampedIndex = Math.min(
    Math.max(Math.trunc(index), 0),
    cinematicGenerationPhases.length - 1
  );
  const phase = cinematicGenerationPhases[clampedIndex];

  if (!phase) {
    throw new Error("No cinematic generation phases are defined.");
  }

  return phase;
}

export function getCompletedGenerationPhases(
  activeIndex: number,
  isGenerating: boolean
): CinematicGenerationPhaseId[] {
  return cinematicGenerationPhases
    .filter(
      (_, index) => index < activeIndex || (!isGenerating && index <= activeIndex)
    )
    .map((phase) => phase.id);
}

export function getPreviewDeviceWidth(device: PreviewDevice): string {
  switch (device) {
    case "desktop":
      return "100%";
    case "tablet":
      return "820px";
    case "mobile":
      return "390px";
  }
}
