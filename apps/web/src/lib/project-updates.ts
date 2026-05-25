import type {
  JsonValue,
  PlaybackMode,
  ProjectMode,
  Scroll3DProject,
  Section
} from "@scroll3d/core";
import { parseContentFieldValue } from "./section-utils";

type SectionUpdater = (section: Section) => Section;

export function updateProjectName(
  project: Scroll3DProject,
  name: string
): Scroll3DProject {
  return touchProject({
    ...project,
    name
  });
}

export function updateProjectMode(
  project: Scroll3DProject,
  mode: ProjectMode
): Scroll3DProject {
  return touchProject({
    ...project,
    mode
  });
}

export function updateThemeColor(
  project: Scroll3DProject,
  key: string,
  value: string
): Scroll3DProject {
  return touchProject({
    ...project,
    theme: {
      ...project.theme,
      colors: {
        ...project.theme.colors,
        [key]: value
      }
    }
  });
}

export function updateThemeTypography(
  project: Scroll3DProject,
  key: string,
  value: JsonValue
): Scroll3DProject {
  return touchProject({
    ...project,
    theme: {
      ...project.theme,
      typography: {
        ...project.theme.typography,
        [key]: value
      }
    }
  });
}

export function updateThemeRadius(
  project: Scroll3DProject,
  key: string,
  value: string
): Scroll3DProject {
  return touchProject({
    ...project,
    theme: {
      ...project.theme,
      radius: {
        ...project.theme.radius,
        [key]: value
      }
    }
  });
}

export function updateThemeSpacing(
  project: Scroll3DProject,
  key: string,
  value: string
): Scroll3DProject {
  return touchProject({
    ...project,
    theme: {
      ...project.theme,
      spacing: {
        ...project.theme.spacing,
        [key]: value
      }
    }
  });
}

export function updateThemeEffect(
  project: Scroll3DProject,
  key: string,
  value: JsonValue
): Scroll3DProject {
  return touchProject({
    ...project,
    theme: {
      ...project.theme,
      effects: {
        ...project.theme.effects,
        [key]: value
      }
    }
  });
}

export function updateSectionName(
  project: Scroll3DProject,
  sectionId: string,
  name: string
): Scroll3DProject {
  return updateSection(project, sectionId, (section) => ({
    ...section,
    name
  }));
}

export function updateSectionContent(
  project: Scroll3DProject,
  sectionId: string,
  key: string,
  value: string
): Scroll3DProject {
  return updateSection(project, sectionId, (section) => ({
    ...section,
    content: {
      ...section.content,
      [key]: parseContentFieldValue(section.content[key], value)
    }
  }));
}

export function updateSectionContentJson(
  project: Scroll3DProject,
  sectionId: string,
  key: string,
  value: JsonValue
): Scroll3DProject {
  return updateSection(project, sectionId, (section) => ({
    ...section,
    content: {
      ...section.content,
      [key]: value
    }
  }));
}

export function moveSection(
  project: Scroll3DProject,
  sectionId: string,
  direction: "up" | "down"
): Scroll3DProject {
  const page = project.pages[0];

  if (!page) {
    return project;
  }

  const orderedSections = [...page.sections].sort(
    (left, right) => left.order - right.order
  );
  const index = orderedSections.findIndex((section) => section.id === sectionId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || targetIndex < 0 || targetIndex >= orderedSections.length) {
    return project;
  }

  const nextSections = [...orderedSections];
  const [section] = nextSections.splice(index, 1);

  if (!section) {
    return project;
  }

  nextSections.splice(targetIndex, 0, section);

  return replacePrimaryPageSections(project, normalizeSectionOrder(nextSections));
}

export function setSectionVisibility(
  project: Scroll3DProject,
  sectionId: string,
  visible: boolean
): Scroll3DProject {
  return updateSection(project, sectionId, (section) => ({
    ...section,
    settings: {
      ...section.settings,
      visible
    }
  }));
}

export function updateScrollLength(
  project: Scroll3DProject,
  value: number
): Scroll3DProject {
  return touchProject({
    ...project,
    scene: {
      ...project.scene,
      scrollLength: Math.max(1, Math.round(value))
    }
  });
}

export function updatePlaybackMode(
  project: Scroll3DProject,
  mode: PlaybackMode
): Scroll3DProject {
  return touchProject({
    ...project,
    scene: {
      ...project.scene,
      playbackMode: mode
    }
  });
}

export function updateSceneName(
  project: Scroll3DProject,
  name: string
): Scroll3DProject {
  return touchProject({
    ...project,
    scene: {
      ...project.scene,
      name
    }
  });
}

export function updateReducedMotionFallbackAlt(
  project: Scroll3DProject,
  alt: string
): Scroll3DProject {
  const fallback = project.scene.reducedMotionFallback;

  if (fallback.type === "none") {
    return project;
  }

  return touchProject({
    ...project,
    scene: {
      ...project.scene,
      reducedMotionFallback: {
        ...fallback,
        alt
      }
    }
  });
}

export function createExportProject(project: Scroll3DProject): Scroll3DProject {
  return {
    ...project,
    pages: project.pages.map((page, pageIndex) =>
      pageIndex === 0
        ? {
            ...page,
            sections: normalizeSectionOrder(
              page.sections.filter((section) => section.settings.visible !== false)
            )
          }
        : page
    )
  };
}

function updateSection(
  project: Scroll3DProject,
  sectionId: string,
  updater: SectionUpdater
): Scroll3DProject {
  const page = project.pages[0];

  if (!page) {
    return project;
  }

  return replacePrimaryPageSections(
    project,
    page.sections.map((section) =>
      section.id === sectionId ? updater(section) : section
    )
  );
}

function replacePrimaryPageSections(
  project: Scroll3DProject,
  sections: Section[]
): Scroll3DProject {
  return touchProject({
    ...project,
    pages: project.pages.map((page, pageIndex) =>
      pageIndex === 0
        ? {
            ...page,
            sections
          }
        : page
    )
  });
}

function normalizeSectionOrder(sections: Section[]): Section[] {
  return sections.map((section, index) => ({
    ...section,
    order: index
  }));
}

function touchProject(project: Scroll3DProject): Scroll3DProject {
  return {
    ...project,
    updatedAt: new Date().toISOString()
  };
}
