import type { JsonValue, Scroll3DProject, Section } from "@scroll3d/core";

export type MotionPresetId =
  | "slow-reveal"
  | "cinematic-zoom"
  | "layered-motion"
  | "snap-transition"
  | "horizontal-sweep"
  | "depth-push"
  | "fade-through"
  | "parallax-drift";

export type TransitionStyleId =
  | "soft-cut"
  | "fade-through"
  | "depth-shift"
  | "snap"
  | "horizontal-wipe"
  | "hold";

export type NarrativeRoleId =
  | "opening-hook"
  | "momentum-build"
  | "feature-reveal"
  | "immersive-transition"
  | "final-cta-impact";

export type SceneIntensity = "quiet" | "balanced" | "high";
export type ScenePacing = "slow" | "measured" | "fast";

export interface MotionPreset {
  id: MotionPresetId;
  label: string;
  description: string;
}

export interface TransitionStyle {
  id: TransitionStyleId;
  label: string;
  description: string;
}

export interface NarrativeRole {
  id: NarrativeRoleId;
  label: string;
  guidance: string;
}

export interface SceneMetadata {
  title: string;
  sceneType: string;
  motionPreset: MotionPresetId;
  transitionStyle: TransitionStyleId;
  narrativeRole: NarrativeRoleId;
  intensity: SceneIntensity;
  pacing: ScenePacing;
  durationBeats: number;
  assetPlaceholder: string;
  directorNote: string;
}

export interface SceneEditorItem {
  id: string;
  order: number;
  section: Section;
  visible: boolean;
  metadata: SceneMetadata;
}

export const motionPresets: MotionPreset[] = [
  {
    id: "slow-reveal",
    label: "Slow Reveal",
    description: "Let the section emerge gradually with a calm camera drift."
  },
  {
    id: "cinematic-zoom",
    label: "Cinematic Zoom",
    description: "Push the viewer into the scene for stronger focus."
  },
  {
    id: "layered-motion",
    label: "Layered Motion",
    description: "Move foreground and background elements at different speeds."
  },
  {
    id: "snap-transition",
    label: "Snap Transition",
    description: "Cut decisively into the next scene for a sharper beat."
  },
  {
    id: "horizontal-sweep",
    label: "Horizontal Sweep",
    description: "Slide the scene laterally like a cinematic panel move."
  },
  {
    id: "depth-push",
    label: "Depth Push",
    description: "Lean into depth and scale changes for a 3D-like moment."
  },
  {
    id: "fade-through",
    label: "Fade Through",
    description: "Blend through the transition with a soft atmospheric pass."
  },
  {
    id: "parallax-drift",
    label: "Parallax Drift",
    description: "Create quiet motion by drifting layers at different depth."
  }
];

export const transitionStyles: TransitionStyle[] = [
  {
    id: "soft-cut",
    label: "Soft Cut",
    description: "A clean scene handoff with minimal motion."
  },
  {
    id: "fade-through",
    label: "Fade Through",
    description: "Let one scene dissolve through the next."
  },
  {
    id: "depth-shift",
    label: "Depth Shift",
    description: "Change scale and layer depth between scenes."
  },
  {
    id: "snap",
    label: "Snap",
    description: "Use a sharp beat for high-impact changes."
  },
  {
    id: "horizontal-wipe",
    label: "Horizontal Wipe",
    description: "Move laterally between story beats."
  },
  {
    id: "hold",
    label: "Hold",
    description: "Let the scene breathe before the next transition."
  }
];

export const narrativeRoles: NarrativeRole[] = [
  {
    id: "opening-hook",
    label: "Opening Hook",
    guidance: "Make the first frame clear, memorable, and emotionally direct."
  },
  {
    id: "momentum-build",
    label: "Momentum Build",
    guidance: "Increase pace and curiosity after the opening."
  },
  {
    id: "feature-reveal",
    label: "Feature Reveal",
    guidance: "Turn product value into a focused visual moment."
  },
  {
    id: "immersive-transition",
    label: "Immersive Transition",
    guidance: "Use motion to carry the viewer into the next section."
  },
  {
    id: "final-cta-impact",
    label: "Final CTA Impact",
    guidance: "Land the story with confidence and a clear action."
  }
];

const sceneTypeFallbacks = ["hero", "feature", "pricing", "faq", "cta", "detail"];
const defaultMotionByIndex: MotionPresetId[] = [
  "slow-reveal",
  "layered-motion",
  "depth-push",
  "fade-through",
  "cinematic-zoom"
];
const defaultRoleByIndex: NarrativeRoleId[] = [
  "opening-hook",
  "momentum-build",
  "feature-reveal",
  "immersive-transition",
  "final-cta-impact"
];

export function getProjectScenes(project: Scroll3DProject): SceneEditorItem[] {
  return [...(project.pages[0]?.sections ?? [])]
    .sort((left, right) => left.order - right.order)
    .map((section, index) => ({
      id: section.id,
      order: index,
      section,
      visible: section.settings.visible !== false,
      metadata: getSceneMetadata(section, index)
    }));
}

export function getSceneMetadata(section: Section, index = 0): SceneMetadata {
  const stored = getStoredSceneMetadata(section);
  const fallbackRole =
    defaultRoleByIndex[Math.min(index, defaultRoleByIndex.length - 1)] ??
    "feature-reveal";
  const fallbackMotion =
    defaultMotionByIndex[Math.min(index, defaultMotionByIndex.length - 1)] ??
    "slow-reveal";

  return {
    title: readString(stored.title, section.name),
    sceneType: readString(stored.sceneType, inferSceneType(section)),
    motionPreset: readEnum(stored.motionPreset, motionPresetIds, fallbackMotion),
    transitionStyle: readEnum(stored.transitionStyle, transitionStyleIds, "soft-cut"),
    narrativeRole: readEnum(stored.narrativeRole, narrativeRoleIds, fallbackRole),
    intensity: readEnum(stored.intensity, sceneIntensities, "balanced"),
    pacing: readEnum(stored.pacing, scenePacings, "measured"),
    durationBeats: readPositiveInteger(stored.durationBeats, Math.max(2, index + 2)),
    assetPlaceholder: readString(stored.assetPlaceholder, "Generated scene media"),
    directorNote: readString(
      stored.directorNote,
      getNarrativeRole(fallbackRole)?.guidance ??
        "Shape this scene as a clear story beat."
    )
  };
}

export function getSceneById(
  project: Scroll3DProject,
  sceneId: string
): SceneEditorItem | undefined {
  return getProjectScenes(project).find((scene) => scene.id === sceneId);
}

export function getFirstSceneId(project: Scroll3DProject): string {
  return getProjectScenes(project)[0]?.id ?? "";
}

export function updateSceneMetadata(
  project: Scroll3DProject,
  sceneId: string,
  patch: Partial<SceneMetadata>
): Scroll3DProject {
  const scenes = getProjectScenes(project);
  const scene = scenes.find((item) => item.id === sceneId);

  if (!scene) {
    return project;
  }

  const nextMetadata = sanitizeSceneMetadata({
    ...scene.metadata,
    ...patch
  });

  return replacePrimarySections(
    project,
    scenes.map((item) => {
      if (item.id !== sceneId) {
        return item.section;
      }

      return {
        ...item.section,
        name: nextMetadata.title,
        settings: {
          ...item.section.settings,
          scene: nextMetadata as unknown as JsonValue
        }
      };
    })
  );
}

export function moveSceneToIndex(
  project: Scroll3DProject,
  sceneId: string,
  targetIndex: number
): Scroll3DProject {
  const scenes = getProjectScenes(project);
  const currentIndex = scenes.findIndex((scene) => scene.id === sceneId);
  const clampedTarget = Math.min(
    Math.max(Math.trunc(targetIndex), 0),
    scenes.length - 1
  );

  if (currentIndex < 0 || currentIndex === clampedTarget) {
    return project;
  }

  const nextScenes = [...scenes];
  const [scene] = nextScenes.splice(currentIndex, 1);

  if (!scene) {
    return project;
  }

  nextScenes.splice(clampedTarget, 0, scene);

  return replacePrimarySections(
    project,
    nextScenes.map((item, index) => ({
      ...item.section,
      order: index
    }))
  );
}

export function getMotionPreset(id: MotionPresetId): MotionPreset | undefined {
  return motionPresets.find((preset) => preset.id === id);
}

export function getTransitionStyle(id: TransitionStyleId): TransitionStyle | undefined {
  return transitionStyles.find((transition) => transition.id === id);
}

export function getNarrativeRole(id: NarrativeRoleId): NarrativeRole | undefined {
  return narrativeRoles.find((role) => role.id === id);
}

export function getSceneProgressLabel(
  scene: SceneEditorItem,
  sceneCount: number
): string {
  return `${String(scene.order + 1)} / ${String(Math.max(sceneCount, 1))}`;
}

const motionPresetIds = motionPresets.map((preset) => preset.id);
const transitionStyleIds = transitionStyles.map((transition) => transition.id);
const narrativeRoleIds = narrativeRoles.map((role) => role.id);
const sceneIntensities: SceneIntensity[] = ["quiet", "balanced", "high"];
const scenePacings: ScenePacing[] = ["slow", "measured", "fast"];

function getStoredSceneMetadata(section: Section): Partial<SceneMetadata> {
  const stored = section.settings.scene;

  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return {};
  }

  return stored;
}

function inferSceneType(section: Section): string {
  const normalized = section.type.toLowerCase();

  return sceneTypeFallbacks.find((type) => normalized.includes(type)) ?? section.type;
}

function sanitizeSceneMetadata(metadata: SceneMetadata): SceneMetadata {
  return {
    title: metadata.title.trim() || "Untitled scene",
    sceneType: metadata.sceneType.trim() || "detail",
    motionPreset: readEnum(metadata.motionPreset, motionPresetIds, "slow-reveal"),
    transitionStyle: readEnum(metadata.transitionStyle, transitionStyleIds, "soft-cut"),
    narrativeRole: readEnum(metadata.narrativeRole, narrativeRoleIds, "feature-reveal"),
    intensity: readEnum(metadata.intensity, sceneIntensities, "balanced"),
    pacing: readEnum(metadata.pacing, scenePacings, "measured"),
    durationBeats: readPositiveInteger(metadata.durationBeats, 3),
    assetPlaceholder: metadata.assetPlaceholder.trim() || "Generated scene media",
    directorNote:
      metadata.directorNote.trim() || "Shape this scene as a clear story beat."
  };
}

function replacePrimarySections(
  project: Scroll3DProject,
  sections: Section[]
): Scroll3DProject {
  return {
    ...project,
    pages: project.pages.map((page, pageIndex) =>
      pageIndex === 0
        ? {
            ...page,
            sections
          }
        : page
    ),
    updatedAt: new Date().toISOString()
  };
}

function readString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function readEnum<T extends string>(
  value: JsonValue | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : fallback;
}

function readPositiveInteger(value: JsonValue | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : fallback;
}
