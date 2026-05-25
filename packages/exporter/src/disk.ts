import { createBundleCopyPlan } from "./copy-plan";
import { createExportWarning } from "./errors";
import { defaultDiskExportConfig, ensureOutputDir, writeExportFile } from "./fs-utils";
import type {
  DiskExportConfig,
  DiskExportResult,
  ExportWarning,
  StaticExportBundle,
  WriteFileResult
} from "./types";

export async function writeStaticExportBundle(
  bundle: StaticExportBundle,
  config: Partial<DiskExportConfig> & { outputDir: string }
): Promise<DiskExportResult> {
  const resolvedConfig: DiskExportConfig = {
    ...defaultDiskExportConfig,
    ...config
  };
  const warnings: ExportWarning[] = [...bundle.warnings];
  const files: WriteFileResult[] = [];
  const copyPlan = createBundleCopyPlan(bundle);

  try {
    const outputDir = await ensureOutputDir(resolvedConfig.outputDir, resolvedConfig);

    for (const file of bundle.files) {
      files.push(await writeExportFile(file, outputDir, resolvedConfig));
    }

    return {
      success: true,
      outputDir,
      files,
      copyPlan,
      warnings,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      outputDir: resolvedConfig.outputDir,
      files,
      copyPlan,
      warnings,
      errors: [
        createExportWarning(
          "disk-export-failed",
          error instanceof Error ? error.message : "Disk export failed.",
          "error"
        )
      ]
    };
  }
}
