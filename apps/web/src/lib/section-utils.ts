import type { JsonValue, Scroll3DProject, Section } from "@scroll3d/core";

export interface EditableContentField {
  key: string;
  value: string;
  kind: "text" | "number" | "boolean" | "complex";
  ctaLike: boolean;
}

export function getPrimaryPage(project: Scroll3DProject) {
  return project.pages[0];
}

export function getOrderedSections(project: Scroll3DProject): Section[] {
  return [...(getPrimaryPage(project)?.sections ?? [])].sort(
    (left, right) => left.order - right.order
  );
}

export function isSectionVisible(section: Section): boolean {
  return section.settings.visible !== false;
}

export function getVisibleSectionCount(project: Scroll3DProject): number {
  return getOrderedSections(project).filter(isSectionVisible).length;
}

export function getEditableContentFields(section: Section): EditableContentField[] {
  return Object.entries(section.content).map(([key, value]) => ({
    key,
    value: formatJsonValueForInput(value),
    kind: getContentFieldKind(value),
    ctaLike: isCtaLikeKey(key)
  }));
}

export function isCtaLikeKey(key: string): boolean {
  return /cta|button|action|label|href|url/i.test(key);
}

export function parseContentFieldValue(
  previousValue: JsonValue | undefined,
  nextValue: string
): JsonValue {
  if (typeof previousValue === "number") {
    const parsed = Number(nextValue);

    return Number.isFinite(parsed) ? parsed : nextValue;
  }

  if (typeof previousValue === "boolean") {
    return nextValue === "true";
  }

  if (previousValue && typeof previousValue === "object") {
    try {
      return JSON.parse(nextValue) as JsonValue;
    } catch {
      return nextValue;
    }
  }

  return nextValue;
}

function getContentFieldKind(value: JsonValue): EditableContentField["kind"] {
  if (typeof value === "number") {
    return "number";
  }

  if (typeof value === "boolean") {
    return "boolean";
  }

  if (value && typeof value === "object") {
    return "complex";
  }

  return "text";
}

function formatJsonValueForInput(value: JsonValue): string {
  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value ?? "");
}
