import {
  localRuntimeConfigPath,
  mergeCatalogWithConfig,
  modelPacks,
  readLocalRuntimeConfig
} from "./runtime-lib.mjs";

const config = readLocalRuntimeConfig(localRuntimeConfigPath);
const catalog = mergeCatalogWithConfig(config);

console.log("Scroll3D model packs");
console.log("====================");
console.log(`Local config: ${config ? localRuntimeConfigPath : "not found"}`);
console.log("");

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

console.log("Model catalog");
console.log("-------------");
for (const model of catalog) {
  console.log(
    `${model.name} (${model.id}) - ${model.stage}/${model.runtime} - ${model.status} - approx ${model.sizeGB} GB`
  );
}
console.log("");

console.log("Per-stage coverage");
console.log("------------------");
for (const stage of ["prompt", "image", "video", "frame", "code"]) {
  const models = catalog.filter((model) => model.stage === stage);

  console.log(
    `${stage}: ${models.length ? models.map((model) => `${model.id}:${model.status}`).join(", ") : "no local model in catalog"}`
  );
}
console.log("");
console.log("Real model downloads are not implemented yet.");
