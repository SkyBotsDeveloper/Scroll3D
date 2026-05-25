import { modelPacks } from "./runtime-lib.mjs";

console.log("Scroll3D model packs");
console.log("====================");

for (const pack of modelPacks) {
  console.log(`${pack.name} (${pack.id})`);
  console.log(`  ${pack.description}`);
  console.log(
    `  RAM: min ${String(pack.minRamGB)} GB, recommended ${String(pack.recommendedRamGB)} GB`
  );
  console.log(
    `  VRAM: min ${String(pack.minVramGB ?? 0)} GB, recommended ${String(
      pack.recommendedVramGB ?? 0
    )} GB`
  );
  console.log(`  Estimated disk: ${String(pack.estimatedDiskGB)} GB`);
  console.log(`  Stages: ${pack.stagesSupported.join(", ")}`);
  console.log("");
}

console.log("Real model downloads are not implemented yet.");
