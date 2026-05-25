import {
  createModelDownloadPlan,
  formatDownloadPlan,
  localRuntimeConfigPath,
  modelDownloadPlanPath,
  readLocalRuntimeConfig,
  recommendModelPack,
  scanSystemSpecs,
  writeModelDownloadPlan
} from "./runtime-lib.mjs";

const specs = scanSystemSpecs();
const config = readLocalRuntimeConfig(localRuntimeConfigPath);
const recommendation = recommendModelPack(specs);
const selectedPack = config?.selectedModelPack ?? recommendation.recommendedPack.id;
const plan = createModelDownloadPlan(specs, selectedPack);

writeModelDownloadPlan(modelDownloadPlanPath, plan);

console.log("Scroll3D model download plan");
console.log("============================");
console.log(
  `Config: ${config ? localRuntimeConfigPath : "not found; using scan recommendation"}`
);
console.log(formatDownloadPlan(plan));
console.log("");
console.log(`Wrote safe local plan: ${modelDownloadPlanPath}`);
console.log("This file is machine-local and ignored by git.");
