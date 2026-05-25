import { describe, expect, it } from "vitest";
import {
  createDefaultLocalRuntimeConfig,
  updateModelStatus
} from "./local-runtime-config";
import {
  createHandshakeRequest,
  createOfflineHandshakeResponse,
  isRuntimeCompatible,
  summarizeRuntimeHandshake,
  validateHandshakeResponse
} from "./handshake";
import type { LocalRuntimeHandshakeResponse } from "./types";

describe("local runtime handshake foundation", () => {
  it("creates a valid offline response", () => {
    const config = createDefaultLocalRuntimeConfig("lite");
    const response = createOfflineHandshakeResponse(config);

    expect(validateHandshakeResponse(response).success).toBe(true);
    expect(response.oneModelAtATime).toBe(true);
    expect(response.maxConcurrentHeavyJobs).toBe(1);
  });

  it("returns not-configured when runtime URL is missing", () => {
    const config = {
      ...createDefaultLocalRuntimeConfig("lite"),
      runtime: {
        ...createDefaultLocalRuntimeConfig("lite").runtime,
        url: ""
      }
    };
    const request = createHandshakeRequest(config);
    const response = createOfflineHandshakeResponse(config);

    expect(request.runtimeUrl).toBeNull();
    expect(response.status).toBe("not-configured");
  });

  it("detects incompatible runtime responses", () => {
    const config = createDefaultLocalRuntimeConfig("lite");
    const response = createOfflineHandshakeResponse(config);

    expect(isRuntimeCompatible(response)).toBe(false);
  });

  it("requires one-model-at-a-time execution", () => {
    const config = createDefaultLocalRuntimeConfig("lite");
    const response = {
      ...createOfflineHandshakeResponse(config),
      maxConcurrentHeavyJobs: 2
    } as unknown;

    expect(validateHandshakeResponse(response).success).toBe(false);
  });

  it("summarizes runtime status for users", () => {
    const config = createDefaultLocalRuntimeConfig("lite");
    const promptModel = config.installedModels.models.find(
      (model) => model.stage === "prompt"
    );

    if (!promptModel) {
      throw new Error("Expected prompt model.");
    }

    const readyConfig = updateModelStatus(config, promptModel.id, "ready");
    const response = createOfflineHandshakeResponse(readyConfig);

    expect(summarizeRuntimeHandshake(response)).toContain("1/2 models ready");
  });

  it("accepts a reachable compatible response shape", () => {
    const config = createDefaultLocalRuntimeConfig("lite");
    const response: LocalRuntimeHandshakeResponse = {
      ...createOfflineHandshakeResponse(config),
      status: "reachable",
      version: {
        protocolVersion: "0.1",
        runtimeVersion: "0.1.0",
        compatible: true
      },
      health: {
        status: "reachable",
        message: "Runtime is reachable."
      }
    };

    expect(isRuntimeCompatible(response)).toBe(true);
  });
});
