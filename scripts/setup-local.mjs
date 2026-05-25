import {
  createLocalRuntimeConfigPlan,
  formatSystemSpecs,
  recommendModelPack,
  scanSystemSpecs,
  writeLocalRuntimeConfigPlan
} from "./runtime-lib.mjs";

const specs = scanSystemSpecs();
const recommendation = recommendModelPack(specs);
const configPath = ".scroll3d/local-runtime.config.json";
const config = createLocalRuntimeConfigPlan(specs, recommendation.recommendedPack.id);

writeLocalRuntimeConfigPlan(configPath, config);

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
console.log(`Wrote safe local runtime config plan: ${configPath}`);
console.log("This path is machine-local and ignored by git.");
console.log("");
console.log("Warnings:");
for (const warning of recommendation.warnings) {
  console.log(`- ${warning}`);
}
console.log("");
console.log("Next steps:");
console.log("1. Restart the server with pnpm dev.");
console.log("2. Open Settings.");
console.log("3. Connect local runtime when a future runtime server is available.");
console.log("4. A future explicit download command will install selected models.");
console.log("");
console.log("Real model downloads are not implemented yet.");
