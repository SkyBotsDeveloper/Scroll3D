import type { ExportWarning } from "./types";

export class StaticExportError extends Error {
  readonly code: string;
  readonly path: string | undefined;

  constructor(warning: ExportWarning) {
    super(warning.message);
    this.name = "StaticExportError";
    this.code = warning.code;
    this.path = warning.path;
  }
}

export function createExportWarning(
  code: string,
  message: string,
  severity: ExportWarning["severity"] = "warning",
  path?: string
): ExportWarning {
  return {
    code,
    message,
    severity,
    ...(path ? { path } : {})
  };
}
