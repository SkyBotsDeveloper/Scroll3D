import type { StaticExporterConfig } from "./types";
import { StaticProjectExporter } from "./static-exporter";

export { createBrowserZipFromBundle } from "./browser-zip";
export * from "./assets";
export * from "./css";
export * from "./errors";
export * from "./frame-manifest";
export * from "./html";
export * from "./javascript";
export * from "./project-json";
export * from "./sanitize";
export * from "./static-exporter";
export type * from "./types";

export function createStaticExporter(
  config: Partial<StaticExporterConfig> = {}
): StaticProjectExporter {
  return new StaticProjectExporter(config);
}

export function exportStaticProject(
  project: unknown,
  config: Partial<StaticExporterConfig> = {}
) {
  return createStaticExporter(config).export(project);
}

export function exportStaticProjectToBundle(
  project: unknown,
  config: Partial<StaticExporterConfig> = {}
) {
  return exportStaticProject(project, config);
}
