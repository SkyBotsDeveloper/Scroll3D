import { checkDoctor } from "./runtime-lib.mjs";

console.log("Scroll3D runtime doctor");
console.log("=======================");

for (const check of checkDoctor()) {
  console.log(`[${check.status}] ${check.name}: ${check.message}`);
}

console.log("");
console.log("Runtime connection and model execution are placeholders in this phase.");
