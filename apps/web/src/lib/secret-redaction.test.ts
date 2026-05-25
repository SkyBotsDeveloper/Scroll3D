import { describe, expect, it } from "vitest";
import { isSecretRef, redactSecretValue, redactSecrets } from "./secret-redaction";

describe("secret redaction", () => {
  it("redacts displayed secret-like values", () => {
    expect(redactSecretValue("primary-api-key")).toBe("pr...ey");
  });

  it("redacts raw secret keys but preserves secret refs", () => {
    const redacted = redactSecrets({
      secretRef: "primary-api-key",
      apiKey: "sk-secret-value"
    }) as { secretRef: string; apiKey: string };

    expect(redacted.secretRef).toBe("primary-api-key");
    expect(redacted.apiKey).toBe("[redacted]");
  });

  it("validates secret ref shape", () => {
    expect(isSecretRef("primary-api-key")).toBe(true);
    expect(isSecretRef("x")).toBe(false);
  });
});
