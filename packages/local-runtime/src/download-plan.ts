import { listModelCatalog, listModelPacks } from "./model-catalog";
import type {
  LocalModelEntry,
  LocalModelPackSelection,
  ModelDownloadAction,
  ModelDownloadPlan,
  ModelDownloadPlanEntry,
  ModelDownloadRequirement,
  ModelDownloadRisk,
  ModelDownloadStatus,
  ModelInstallInstruction,
  ModelInstallPlanSummary,
  ModelPackDefinition,
  ModelStage,
  RuntimeSystemSpecs
} from "./types";

const allStages: ModelStage[] = ["prompt", "image", "video", "frame", "code"];

export function createModelDownloadPlan(
  specs: RuntimeSystemSpecs,
  selectedPack: LocalModelPackSelection | ModelPackDefinition,
  catalog: LocalModelEntry[] = listModelCatalog()
): ModelDownloadPlan {
  const pack = resolvePack(selectedPack);
  const models =
    pack.id === "custom"
      ? []
      : catalog.filter((model) => pack.modelIds.includes(model.id));
  const warnings = [
    "Downloads are disabled in this phase.",
    "This plan is deterministic guidance only; no models are downloaded or executed.",
    ...pack.warnings,
    ...(typeof specs.vramGB === "number"
      ? []
      : [
          "VRAM was not detected; local image/video models may require hybrid fallback."
        ]),
    ...(typeof specs.freeDiskGB === "number"
      ? []
      : ["Free disk could not be detected; verify storage before future downloads."])
  ];
  const entries = models.map((model) => createPlanEntry(model, specs));
  const summary = buildSummary(pack.id, entries, warnings);

  return {
    id: `model-download-plan-${pack.id}`,
    selectedPack: pack.id,
    entries,
    summary,
    warnings,
    createdAt: new Date().toISOString(),
    metadata: {
      downloadsEnabled: false,
      selectedPackName: pack.name,
      generatedBy: "scroll3d-local-runtime"
    }
  };
}

export function summarizeDownloadPlan(
  plan: Pick<ModelDownloadPlan, "selectedPack" | "entries" | "warnings">
): ModelInstallPlanSummary {
  return buildSummary(plan.selectedPack, plan.entries, plan.warnings);
}

export function validateDownloadPlan(plan: ModelDownloadPlan): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  if (!plan.id.trim()) {
    errors.push("Download plan id is required.");
  }

  if (JSON.stringify(plan).toLowerCase().includes("sk-")) {
    errors.push("Download plan must not contain raw secret-looking values.");
  }

  for (const entry of plan.entries) {
    if (seen.has(entry.modelId)) {
      errors.push(`Duplicate model entry: ${entry.modelId}`);
    }

    seen.add(entry.modelId);

    if (entry.estimatedSizeGB < 0) {
      errors.push(`Model ${entry.modelId} has invalid estimated size.`);
    }

    if (entry.source.reference?.startsWith("http")) {
      errors.push(`Model ${entry.modelId} has a direct URL; use placeholders only.`);
    }
  }

  return errors;
}

export function filterPlanByStage(
  plan: ModelDownloadPlan,
  stage: ModelStage
): ModelDownloadPlanEntry[] {
  return plan.entries.filter((entry) => entry.stage === stage);
}

export function estimateTotalDownloadSize(
  plan: Pick<ModelDownloadPlan, "entries"> | ModelDownloadPlanEntry[]
): number {
  const entries = Array.isArray(plan) ? plan : plan.entries;

  return roundGB(entries.reduce((total, entry) => total + entry.estimatedSizeGB, 0));
}

export function getUnsupportedPlanEntries(
  plan: ModelDownloadPlan
): ModelDownloadPlanEntry[] {
  return plan.entries.filter(
    (entry) =>
      entry.status === "not-supported-yet" ||
      entry.action === "skip" ||
      entry.risks.includes("unsupported-platform")
  );
}

function createPlanEntry(
  model: LocalModelEntry,
  specs: RuntimeSystemSpecs
): ModelDownloadPlanEntry {
  const requirements = createRequirements(model, specs);
  const risks = createRisks(model, specs);
  const action = resolveAction(model);
  const status = resolveStatus(model, risks);
  const warnings = [
    ...model.notes,
    ...requirements
      .filter((requirement) => requirement.warning)
      .map((requirement) => requirement.warning)
      .filter((warning): warning is string => Boolean(warning)),
    ...(model.licenseNote ? [model.licenseNote] : []),
    "No download is performed by this plan."
  ];

  return {
    modelId: model.id,
    stage: model.stage,
    name: model.name,
    runtime: model.runtime,
    providerType: model.providerType,
    estimatedSizeGB: model.sizeGB,
    estimatedDiskAfterInstallGB: roundGB(model.sizeGB * 1.2),
    requirements,
    source: {
      type: model.downloadUrl ? "placeholder" : "external-tool",
      label: model.downloadUrl ? "Placeholder future source" : "External tool",
      reference: model.downloadUrl,
      requiresLicenseReview: Boolean(model.licenseNote)
    },
    action,
    status,
    installInstructions: createInstallInstructions(model, action),
    risks,
    warnings
  };
}

function createRequirements(
  model: LocalModelEntry,
  specs: RuntimeSystemSpecs
): ModelDownloadRequirement[] {
  const ramSatisfied =
    typeof specs.totalRamGB !== "number" || specs.totalRamGB >= model.minRamGB;
  const vramRequired = model.minVramGB ?? 0;
  const vramSatisfied =
    vramRequired === 0 ||
    typeof specs.vramGB !== "number" ||
    specs.vramGB >= vramRequired;
  const diskSatisfied =
    typeof specs.freeDiskGB !== "number" || specs.freeDiskGB >= model.sizeGB;

  return [
    {
      type: "ram",
      label: "System RAM",
      required: `${String(model.minRamGB)} GB minimum`,
      available: formatGB(specs.totalRamGB),
      satisfied: ramSatisfied,
      warning: ramSatisfied ? undefined : "System RAM is below the model minimum."
    },
    {
      type: "vram",
      label: "GPU VRAM",
      required: `${String(vramRequired)} GB minimum`,
      available: formatGB(specs.vramGB),
      satisfied: vramSatisfied,
      warning:
        vramSatisfied && typeof specs.vramGB === "number"
          ? undefined
          : vramRequired > 0
            ? "VRAM is missing or below the model minimum."
            : undefined
    },
    {
      type: "disk",
      label: "Free disk",
      required: `${String(model.sizeGB)} GB estimated download`,
      available: formatGB(specs.freeDiskGB),
      satisfied: diskSatisfied,
      warning: diskSatisfied ? undefined : "Free disk is below the estimated size."
    },
    {
      type: "runtime",
      label: "Runtime",
      required: model.runtime,
      satisfied: model.runtime !== "api",
      warning:
        model.runtime === "api"
          ? "API-backed entries require provider configuration."
          : undefined
    },
    {
      type: "license",
      label: "License",
      required: model.licenseNote ?? "Review required before future downloads",
      satisfied: false,
      warning: "Review model license before any future download."
    }
  ];
}

function createRisks(
  model: LocalModelEntry,
  specs: RuntimeSystemSpecs
): ModelDownloadRisk[] {
  const risks = new Set<ModelDownloadRisk>();

  if (model.sizeGB >= 32) {
    risks.add("large-download");
  }

  if ((model.minVramGB ?? 0) >= 8 || (model.recommendedVramGB ?? 0) >= 12) {
    risks.add("high-vram");
  }

  if (model.licenseNote) {
    risks.add("license-review");
  }

  if (model.runtime === "comfyui") {
    risks.add("experimental");
  }

  if (typeof specs.freeDiskGB === "number" && specs.freeDiskGB < model.sizeGB) {
    risks.add("disk-space-warning");
  }

  if (specs.arch && !["x64", "arm64"].includes(specs.arch)) {
    risks.add("unsupported-platform");
  }

  return [...risks];
}

function resolveAction(model: LocalModelEntry): ModelDownloadAction {
  if (model.runtime === "ffmpeg") {
    return "external-tool";
  }

  if (!model.downloadUrl) {
    return "manual-install";
  }

  return "future-download";
}

function resolveStatus(
  model: LocalModelEntry,
  risks: ModelDownloadRisk[]
): ModelDownloadStatus {
  if (risks.includes("unsupported-platform")) {
    return "not-supported-yet";
  }

  if (model.status === "ready" || model.status === "installed") {
    return "installed";
  }

  return "waiting-confirmation";
}

function createInstallInstructions(
  model: LocalModelEntry,
  action: ModelDownloadAction
): ModelInstallInstruction[] {
  return [
    {
      step: 1,
      title: "Review requirements",
      note: `Confirm RAM, VRAM, disk, runtime, and license requirements for ${model.name}.`
    },
    {
      step: 2,
      title: "Wait for explicit download support",
      command:
        action === "external-tool" ? model.installCommand : "future download command",
      note:
        action === "external-tool"
          ? "Install the external tool manually if you choose to prepare this runtime."
          : "Scroll3D will add an explicit user-confirmed download command in a later phase."
    },
    {
      step: 3,
      title: "Restart and connect",
      command: "pnpm runtime:handshake",
      note: "After future installation, restart the app and verify local runtime readiness."
    }
  ];
}

function buildSummary(
  selectedPack: LocalModelPackSelection,
  entries: ModelDownloadPlanEntry[],
  warnings: string[]
): ModelInstallPlanSummary {
  return {
    selectedPack,
    entryCount: entries.length,
    stages: allStages.filter((stage) => entries.some((entry) => entry.stage === stage)),
    totalEstimatedDownloadGB: estimateTotalDownloadSize(entries),
    totalEstimatedDiskAfterInstallGB: roundGB(
      entries.reduce(
        (total, entry) => total + (entry.estimatedDiskAfterInstallGB ?? 0),
        0
      )
    ),
    unsupportedCount: getUnsupportedCount(entries),
    riskyEntryCount: entries.filter((entry) => entry.risks.length > 0).length,
    readyCount: entries.filter(
      (entry) => entry.status === "installed" || entry.status === "downloaded"
    ).length,
    noDownloadsPerformed: true,
    warnings: [...new Set(warnings)]
  };
}

function getUnsupportedCount(entries: ModelDownloadPlanEntry[]): number {
  return entries.filter(
    (entry) =>
      entry.status === "not-supported-yet" ||
      entry.action === "skip" ||
      entry.risks.includes("unsupported-platform")
  ).length;
}

function resolvePack(
  selectedPack: LocalModelPackSelection | ModelPackDefinition
): ModelPackDefinition {
  if (typeof selectedPack !== "string") {
    return selectedPack;
  }

  const pack = listModelPacks().find((candidate) => candidate.id === selectedPack);

  if (!pack) {
    throw new Error(`Unknown model pack: ${selectedPack}`);
  }

  return pack;
}

function formatGB(value: number | undefined): string {
  return typeof value === "number" ? `${String(value)} GB` : "Unknown";
}

function roundGB(value: number): number {
  return Math.round(value * 10) / 10;
}
