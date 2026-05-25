import { ProjectModeSchema, Scroll3DProjectSchema } from "./schemas";
import type { ExportSettings, Scroll3DProject, ScrollScene, Theme } from "./types";

export type CreateProjectInput = Pick<Scroll3DProject, "name"> &
  Partial<Omit<Scroll3DProject, "name">>;

export function parseProject(input: unknown): Scroll3DProject {
  return Scroll3DProjectSchema.parse(input);
}

export function safeParseProject(input: unknown) {
  return Scroll3DProjectSchema.safeParse(input);
}

export function validateProject(input: unknown): input is Scroll3DProject {
  return Scroll3DProjectSchema.safeParse(input).success;
}

export function isProjectMode(value: unknown): value is Scroll3DProject["mode"] {
  return ProjectModeSchema.safeParse(value).success;
}

export function createProject(input: CreateProjectInput): Scroll3DProject {
  const now = new Date().toISOString();

  return parseProject({
    id: input.id ?? createId("project"),
    name: input.name,
    version: input.version ?? "0.1.0",
    mode: input.mode ?? "hybrid",
    theme: input.theme ?? defaultTheme,
    pages: input.pages ?? [],
    assets: input.assets ?? [],
    scene: input.scene ?? createEmptyScene(),
    providers: input.providers ?? [],
    agents: input.agents ?? [],
    exportSettings: input.exportSettings ?? defaultExportSettings,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now
  });
}

export const defaultTheme: Theme = {
  colors: {
    background: "#08090d",
    foreground: "#f6f7fb",
    primary: "#42d6a4",
    secondary: "#ffb54d",
    muted: "#a3a8b8"
  },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    headingFontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem"
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px"
  },
  effects: {}
};

export const defaultExportSettings: ExportSettings = {
  format: "static",
  includeProjectJson: true,
  minify: true,
  outputDir: "dist"
};

export function createEmptyScene(): ScrollScene {
  return {
    id: createId("scene"),
    name: "Untitled Scroll Scene",
    sourceVideo: null,
    frameSets: [],
    scrollLength: 1000,
    playbackMode: "scroll",
    reducedMotionFallback: {
      type: "none"
    }
  };
}

function createId(prefix: string): string {
  return `${prefix}_${globalThis.crypto.randomUUID()}`;
}
