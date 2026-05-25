import type { Scroll3DProject } from "@scroll3d/core";
import { createAssetCopyPlan } from "./assets";
import { createExportWarning } from "./errors";
import { createFrameCopyPlan } from "./frames";
import { isUnsafeReferencePath, sanitizeFilePath } from "./sanitize";
import type {
  CopyPlan,
  CopyPlanEntryKind,
  CopyPlanOptions,
  ExportWarning,
  StaticExportBundle
} from "./types";

const defaultCopyPlanOptions: CopyPlanOptions = {
  assetMode: "reference",
  frameMode: "reference",
  includeBundleFiles: true
};

export function createExportCopyPlan(
  project: Scroll3DProject,
  bundle: StaticExportBundle,
  options: Partial<CopyPlanOptions> = {}
): CopyPlan {
  const config = {
    ...defaultCopyPlanOptions,
    ...options
  };
  const plans = [
    ...(config.includeBundleFiles ? [createBundleCopyPlan(bundle)] : []),
    createAssetCopyPlan(project, bundle, { assetMode: config.assetMode }),
    createFrameCopyPlan(project, bundle, { frameMode: config.frameMode })
  ];

  return mergeCopyPlans(...plans);
}

export function createBundleCopyPlan(bundle: StaticExportBundle): CopyPlan {
  const entries = bundle.files.map((file) => ({
    sourcePath: file.path,
    destinationPath: file.path,
    kind: classifyBundleFile(file.path),
    required: true,
    ...(file.size === undefined ? {} : { size: file.size }),
    action: "copy" as const
  }));

  return {
    id: `bundle-copy-plan-${bundle.id}`,
    entries,
    warnings: [],
    createdAt: new Date().toISOString()
  };
}

export function mergeCopyPlans(...plans: CopyPlan[]): CopyPlan {
  const entries = plans.flatMap((plan) => plan.entries);
  const warnings = plans.flatMap((plan) => plan.warnings);
  const mergedPlan: CopyPlan = {
    id: `copy-plan-${plans.map((plan) => plan.id).join("-")}`,
    entries,
    warnings,
    createdAt: new Date().toISOString()
  };

  return {
    ...mergedPlan,
    warnings: [...warnings, ...validateCopyPlan(mergedPlan)]
  };
}

export function validateCopyPlan(plan: CopyPlan): ExportWarning[] {
  const warnings: ExportWarning[] = [];

  for (const entry of plan.entries) {
    try {
      sanitizeFilePath(entry.destinationPath);
    } catch {
      warnings.push(
        createExportWarning(
          "copy-plan-unsafe-destination",
          `Copy plan destination '${entry.destinationPath}' is unsafe.`,
          "error",
          entry.destinationPath
        )
      );
    }

    if (entry.action === "copy" && isUnsafeReferencePath(entry.sourcePath)) {
      warnings.push(
        createExportWarning(
          "copy-plan-unsafe-source",
          `Copy plan source '${entry.sourcePath}' is unsafe for copying.`,
          "error",
          entry.sourcePath
        )
      );
    }
  }

  return warnings;
}

function classifyBundleFile(filePath: string): CopyPlanEntryKind {
  if (filePath === "scroll-engine.js") {
    return "runtime";
  }

  if (filePath === "project.json") {
    return "project";
  }

  if (filePath === "README.md") {
    return "readme";
  }

  if (filePath.endsWith("manifest.json")) {
    return "manifest";
  }

  return "other";
}
