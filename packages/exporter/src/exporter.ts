import { parseProject } from "@scroll3d/core";
import { createExportCopyPlan, mergeCopyPlans } from "./copy-plan";
import { writeStaticExportBundle } from "./disk";
import { createExportWarning } from "./errors";
import type { StaticExporterConfig } from "./types";
import { StaticProjectExporter } from "./static-exporter";
import { createZipFromBundle, writeZipFromBundle } from "./zip";
import type {
  CopyPlan,
  DiskExportConfig,
  DiskExportResult,
  ExportResult,
  ExportWarning,
  ZipExportConfig,
  ZipExportResult
} from "./types";

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
): ExportResult {
  return exportStaticProject(project, config);
}

export async function exportStaticProjectToDirectory(
  project: unknown,
  staticConfig: Partial<StaticExporterConfig> = {},
  diskConfig: Partial<DiskExportConfig> & { outputDir?: string } = {}
): Promise<DiskExportResult> {
  const bundleResult = exportStaticProjectToBundle(project, staticConfig);

  if (!bundleResult.success || !bundleResult.bundle) {
    return createFailedDiskResult(
      diskConfig.outputDir ?? staticConfig.outputDir ?? "dist",
      bundleResult.errors,
      bundleResult.warnings
    );
  }

  const outputDir =
    diskConfig.outputDir ??
    staticConfig.outputDir ??
    getBundleOutputDir(bundleResult.bundle.metadata);

  const diskResult = await writeStaticExportBundle(bundleResult.bundle, {
    ...diskConfig,
    outputDir
  });

  try {
    const validatedProject = parseProject(project);
    const exportCopyPlan = createExportCopyPlan(validatedProject, bundleResult.bundle, {
      assetMode: staticConfig.assetMode ?? "reference",
      frameMode: staticConfig.frameMode ?? "reference",
      includeBundleFiles: false
    });

    return {
      ...diskResult,
      copyPlan: mergeCopyPlans(diskResult.copyPlan, exportCopyPlan),
      warnings: [...diskResult.warnings, ...exportCopyPlan.warnings]
    };
  } catch (error) {
    return {
      ...diskResult,
      success: false,
      errors: [
        ...diskResult.errors,
        createExportWarning(
          "copy-plan-failed",
          error instanceof Error ? error.message : "Copy plan generation failed.",
          "error"
        )
      ]
    };
  }
}

export async function exportStaticProjectToZip(
  project: unknown,
  staticConfig: Partial<StaticExporterConfig> = {},
  zipConfig: Partial<ZipExportConfig> = {}
): Promise<ZipExportResult> {
  const bundleResult = exportStaticProjectToBundle(project, staticConfig);

  if (!bundleResult.success || !bundleResult.bundle) {
    return {
      success: false,
      filename: zipConfig.filename ?? "scroll3d-export.zip",
      bytes: 0,
      warnings: bundleResult.warnings,
      errors: bundleResult.errors
    };
  }

  if (zipConfig.outputPath) {
    return writeZipFromBundle(bundleResult.bundle, {
      ...zipConfig,
      outputPath: zipConfig.outputPath
    });
  }

  return createZipFromBundle(bundleResult.bundle, zipConfig);
}

function createFailedDiskResult(
  outputDir: string,
  errors: ExportWarning[],
  warnings: ExportWarning[]
): DiskExportResult {
  return {
    success: false,
    outputDir,
    files: [],
    copyPlan: createEmptyCopyPlan(),
    warnings,
    errors
  };
}

function createEmptyCopyPlan(): CopyPlan {
  return {
    id: "copy-plan-empty",
    entries: [],
    warnings: [],
    createdAt: new Date().toISOString()
  };
}

function getBundleOutputDir(metadata: Record<string, unknown>): string {
  return typeof metadata.outputDir === "string" ? metadata.outputDir : "dist";
}
