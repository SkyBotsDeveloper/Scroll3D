import { describe, expect, it } from "vitest";
import {
  escapeAttribute,
  escapeHtml,
  redactSecrets,
  safeJsonStringify,
  sanitizeCssIdentifier,
  sanitizeFilePath
} from "./index";

describe("sanitization helpers", () => {
  it("escapes HTML and attributes", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
    expect(escapeAttribute("`quoted`")).toBe("&#96;quoted&#96;");
  });

  it("blocks path traversal", () => {
    expect(() => sanitizeFilePath("../index.html")).toThrow("Unsafe export file path");
    expect(sanitizeFilePath("/assets/site.css")).toBe("assets/site.css");
  });

  it("sanitizes CSS identifiers", () => {
    expect(sanitizeCssIdentifier("Primary Color!")).toBe("primary-color");
  });

  it("redacts secret-looking values", () => {
    const redacted = redactSecrets({
      apiKey: "sk-secret-value",
      nested: {
        token: "token-value"
      }
    });

    expect(JSON.stringify(redacted)).not.toContain("sk-secret-value");
    expect(JSON.stringify(redacted)).toContain("[redacted]");
  });

  it("stringifies JSON safely", () => {
    const json = safeJsonStringify({ secretRef: { id: "api-key" } });

    expect(json).toContain("[redacted]");
    expect(json).not.toContain("api-key");
  });
});
