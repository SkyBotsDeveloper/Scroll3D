import { sampleProject } from "@scroll3d/core";
import { describe, expect, it } from "vitest";
import { formatProjectJson } from "./sample-project";
import { validateProjectJson } from "./validation";

describe("validateProjectJson", () => {
  it("accepts the sample project JSON", () => {
    const result = validateProjectJson(formatProjectJson(sampleProject));

    expect(result.ok).toBe(true);
    expect(result.project?.id).toBe(sampleProject.id);
  });

  it("reports invalid JSON without throwing", () => {
    const result = validateProjectJson("{bad json");

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("Invalid JSON");
  });

  it("reports schema validation errors", () => {
    const result = validateProjectJson(JSON.stringify({ id: "project_invalid" }));

    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
