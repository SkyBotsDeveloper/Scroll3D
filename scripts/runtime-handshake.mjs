import {
  createOfflineHandshakeResponse,
  formatHandshakeResponse,
  localRuntimeConfigPath,
  readLocalRuntimeConfig
} from "./runtime-lib.mjs";

const config = readLocalRuntimeConfig(localRuntimeConfigPath);
const response = createOfflineHandshakeResponse(config);

console.log("Scroll3D local runtime handshake");
console.log("=================================");
console.log(`Config: ${config ? localRuntimeConfigPath : "not found"}`);
console.log(formatHandshakeResponse(response));
console.log("");
console.log("This is an offline handshake placeholder. No server was contacted.");
