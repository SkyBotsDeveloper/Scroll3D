import { formatSystemSpecs, scanSystemSpecs } from "./runtime-lib.mjs";

const specs = scanSystemSpecs();

console.log("Scroll3D runtime scan");
console.log("=====================");
console.log(formatSystemSpecs(specs));
console.log("");
console.log("No model downloads or model execution happen in this phase.");
