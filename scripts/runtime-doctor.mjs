import { checkDoctor } from "./runtime-lib.mjs";

console.log("Scroll3D runtime doctor");
console.log("=======================");

for (const check of checkDoctor()) {
  console.log(`[${check.status}] ${check.name}: ${check.message}`);
}

console.log("");
console.log("Use pnpm runtime:plan-downloads to inspect download requirements.");
console.log("Use pnpm runtime:handshake to inspect the offline runtime handshake.");
console.log("Runtime connection and model execution are placeholders in this phase.");
