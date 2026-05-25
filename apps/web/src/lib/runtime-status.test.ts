import { describe, expect, it } from "vitest";
import {
  checkLocalRuntimeStatus,
  createOfflineRuntimeHandshakeDisplay,
  formatRuntimeStatus
} from "./runtime-status";
import { createDefaultSettings } from "./settings-state";

describe("runtime status helpers", () => {
  it("formats runtime status labels", () => {
    expect(formatRuntimeStatus("connected")).toBe("Connected");
    expect(formatRuntimeStatus("unknown")).toBe("Unknown");
  });

  it("returns unavailable when runtime URL is missing", () => {
    const runtime = {
      ...createDefaultSettings().localRuntime,
      runtimeUrl: ""
    };

    expect(checkLocalRuntimeStatus(runtime).status).toBe("unavailable");
  });

  it("returns placeholder disconnected status for configured runtime URL", () => {
    const runtime = createDefaultSettings().localRuntime;

    expect(checkLocalRuntimeStatus(runtime).status).toBe("disconnected");
  });

  it("creates offline handshake display data", () => {
    const runtime = createDefaultSettings().localRuntime;
    const handshake = createOfflineRuntimeHandshakeDisplay(runtime);

    expect(handshake.oneModelAtATime).toBe(true);
    expect(handshake.maxConcurrentHeavyJobs).toBe(1);
    expect(handshake.summary).toContain("Runtime");
  });
});
