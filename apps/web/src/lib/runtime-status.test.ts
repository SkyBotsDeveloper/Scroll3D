import { describe, expect, it } from "vitest";
import { checkLocalRuntimeStatus, formatRuntimeStatus } from "./runtime-status";
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
});
