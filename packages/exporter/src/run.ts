import {
  exportStaticProjectToBundle,
  exportStaticProjectToDirectory,
  exportStaticProjectToZip
} from "./exporter";
import { createExportWarning } from "./errors";
import type { RunStaticExportOptions, RunStaticExportResult } from "./types";

export async function runStaticExport(
  project: unknown,
  options: RunStaticExportOptions
): Promise<RunStaticExportResult> {
  if (options.target === "bundle") {
    const result = exportStaticProjectToBundle(project, options.staticConfig);

    return {
      success: result.success,
      target: "bundle",
      bundleResult: result,
      warnings: result.warnings,
      errors: result.errors
    };
  }

  if (options.target === "directory") {
    const result = await exportStaticProjectToDirectory(project, options.staticConfig, {
      ...options.diskConfig,
      ...(options.outputDir ? { outputDir: options.outputDir } : {}),
      ...(options.dryRun === undefined ? {} : { dryRun: options.dryRun })
    });

    return {
      success: result.success,
      target: "directory",
      diskResult: result,
      warnings: result.warnings,
      errors: result.errors
    };
  }

  if (options.target === "zip") {
    const result = await exportStaticProjectToZip(project, options.staticConfig, {
      ...options.zipConfig,
      ...(options.zipPath ? { outputPath: options.zipPath } : {})
    });

    return {
      success: result.success,
      target: "zip",
      zipResult: result,
      warnings: result.warnings,
      errors: result.errors
    };
  }

  const error = createExportWarning(
    "invalid-export-target",
    `Unsupported static export target: ${options.target}`,
    "error"
  );

  return {
    success: false,
    target: options.target,
    warnings: [],
    errors: [error]
  };
}
