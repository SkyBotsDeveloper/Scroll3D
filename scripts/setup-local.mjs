import {
  createModelDownloadPlan,
  createLocalRuntimeConfigPlan,
  formatDownloadPlan,
  formatSystemSpecs,
  localRuntimeConfigPath,
  modelDownloadPlanPath,
  recommendModelPack,
  scanSystemSpecs,
  writeModelDownloadPlan,
  writeLocalRuntimeConfigPlan
} from "./runtime-lib.mjs";

const specs = scanSystemSpecs();
const recommendation = recommendModelPack(specs);
const config = createLocalRuntimeConfigPlan(specs, recommendation.recommendedPack.id);
const downloadPlan = createModelDownloadPlan(
  specs,
  recommendation.recommendedPack.id,
  config.installedModels.models
);

writeLocalRuntimeConfigPlan(localRuntimeConfigPath, config);
writeModelDownloadPlan(modelDownloadPlanPath, downloadPlan);

console.log("Scroll3D local setup planner");
console.log("============================");
console.log(formatSystemSpecs(specs));
console.log("");
console.log(`Recommended model pack: ${recommendation.recommendedPack.name}`);
console.log(recommendation.recommendedPack.description);
console.log("");
console.log("Reasons:");
for (const reason of recommendation.reasons) {
  console.log(`- ${reason}`);
}
console.log("");
console.log(`Wrote safe local runtime config plan: ${localRuntimeConfigPath}`);
console.log(`Wrote safe model download plan: ${modelDownloadPlanPath}`);
console.log("These paths are machine-local and ignored by git.");
console.log("");
console.log("Download plan summary:");
console.log(formatDownloadPlan(downloadPlan));
console.log("");
console.log("Warnings:");
for (const warning of recommendation.warnings) {
  console.log(`- ${warning}`);
}
console.log("");
console.log("Next steps:");
console.log("1. Restart the server with pnpm dev.");
console.log("2. Inspect the plan with pnpm runtime:plan-downloads.");
console.log("3. Use a future explicit download command only after confirmation.");
console.log("4. Check runtime guidance with pnpm runtime:handshake.");
console.log("5. Open Settings and connect local runtime when a server is available.");
console.log("");
console.log("Real model downloads are not implemented yet.");
