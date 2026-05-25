import type { Scroll3DProject } from "@scroll3d/core";

export const editableColorKeys = [
  "background",
  "foreground",
  "primary",
  "secondary",
  "accent",
  "muted",
  "panel"
] as const;

export const editableRadiusKeys = ["sm", "md", "lg"] as const;

export function getThemeColor(project: Scroll3DProject, key: string): string {
  return project.theme.colors[key] ?? "";
}

export function getThemeRadius(project: Scroll3DProject, key: string): string {
  return project.theme.radius[key] ?? "";
}

export function getThemeTypography(project: Scroll3DProject, key: string): string {
  const value = project.theme.typography[key];

  return typeof value === "string" ? value : JSON.stringify(value ?? "");
}

export function isLikelyCssColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value.trim()) || /^#[0-9a-f]{3}$/i.test(value.trim());
}

export function normalizeCssColorInput(value: string): string {
  const trimmed = value.trim();

  return isLikelyCssColor(trimmed) ? trimmed : value;
}
