import { safeParseProject, type Scroll3DProject } from "@scroll3d/core";

export interface ProjectValidationResult {
  ok: boolean;
  project?: Scroll3DProject;
  errors: string[];
}

export function validateProjectJson(json: string): ProjectValidationResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch (error) {
    return {
      ok: false,
      errors: [
        error instanceof Error ? `Invalid JSON: ${error.message}` : "Invalid JSON."
      ]
    };
  }

  const result = safeParseProject(parsed);

  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "project";

        return `${path}: ${issue.message}`;
      })
    };
  }

  return {
    ok: true,
    project: result.data,
    errors: []
  };
}

export function summarizeValidation(result: ProjectValidationResult): string {
  if (result.ok) {
    return "Project JSON is valid.";
  }

  return `${String(result.errors.length)} validation issue${
    result.errors.length === 1 ? "" : "s"
  } found.`;
}
