import type { StaticExporterConfig } from "./types";
import { StaticProjectExporter } from "./static-exporter";

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
