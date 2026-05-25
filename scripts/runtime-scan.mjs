import {
  formatSystemSpecs,
  recommendModelPack,
  scanSystemSpecs
} from "./runtime-lib.mjs";

const specs = scanSystemSpecs();
const recommendation = recommendModelPack(specs);

console.log("Scroll3D runtime scan");
console.log("=====================");
console.log(formatSystemSpecs(specs));
console.log("");
console.log(`Recommended pack: ${recommendation.recommendedPack.name}`);
for (const reason of recommendation.reasons) {
  console.log(`- ${reason}`);
}
console.log("");
console.log("No model downloads or model execution happen in this phase.");
