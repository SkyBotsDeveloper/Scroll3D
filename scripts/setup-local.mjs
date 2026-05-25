import {
  formatSystemSpecs,
  recommendModelPack,
  scanSystemSpecs
} from "./runtime-lib.mjs";

const specs = scanSystemSpecs();
const recommendation = recommendModelPack(specs);

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
console.log("Warnings:");
for (const warning of recommendation.warnings) {
  console.log(`- ${warning}`);
}
console.log("");
console.log("Real model downloads are not implemented yet.");
