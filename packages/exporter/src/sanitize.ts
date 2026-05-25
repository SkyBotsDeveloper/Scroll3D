const secretLikeKeys = [
  "apiKey",
  "apikey",
  "authorization",
  "bearer",
  "password",
  "secret",
  "secretRef",
  "token"
];

const localAbsolutePathPatterns = [
  /^[a-zA-Z]:[\\/]/,
  /^file:/i,
  /^\/(?:Users|home|root|tmp|var|etc)\//i
];

export function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeAttribute(value: unknown): string {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

export function sanitizeFilePath(path: string): string {
  const normalizedPath = path.trim().replaceAll("\\", "/").replace(/^\/+/, "");
  const parts = normalizedPath.split("/").filter((part) => part.length > 0);

  if (
    parts.length === 0 ||
    parts.some((part) => part === "." || part === "..") ||
    normalizedPath.includes("../")
  ) {
    throw new Error(`Unsafe export file path: ${path}`);
  }

  return parts.map(sanitizePathPart).join("/");
}

export function sanitizeCssIdentifier(value: string): string {
  const identifier = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return identifier || "value";
}

export function sanitizeCssValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (
    trimmedValue.length === 0 ||
    /[{};]/.test(trimmedValue) ||
    /url\s*\(/i.test(trimmedValue) ||
    /expression\s*\(/i.test(trimmedValue) ||
    /@import/i.test(trimmedValue)
  ) {
    return null;
  }

  return trimmedValue;
}

export function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item));
  }

  if (value && typeof value === "object") {
    const redacted: Record<string, unknown> = {};

    for (const [key, childValue] of Object.entries(value)) {
      if (isSecretLikeKey(key)) {
        redacted[key] = "[redacted]";
      } else {
        redacted[key] = redactSecrets(childValue);
      }
    }

    return redacted;
  }

  if (typeof value === "string" && looksLikeSecretValue(value)) {
    return "[redacted]";
  }

  return value;
}

export function safeJsonStringify(value: unknown): string {
  return `${JSON.stringify(redactSecrets(value), null, 2)}\n`;
}

export function isLocalAbsolutePath(path: string): boolean {
  return localAbsolutePathPatterns.some((pattern) => pattern.test(path.trim()));
}

export function isUnsafeReferencePath(path: string): boolean {
  const normalizedPath = path.trim().replaceAll("\\", "/");

  return (
    normalizedPath.length === 0 ||
    normalizedPath.includes("../") ||
    normalizedPath.split("/").some((part) => part === "..") ||
    isLocalAbsolutePath(normalizedPath)
  );
}

export function sanitizeReferencePath(path: string): string | null {
  if (isUnsafeReferencePath(path)) {
    return null;
  }

  return path.trim().replaceAll("\\", "/");
}

function sanitizePathPart(part: string): string {
  return (
    part
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "file"
  );
}

function isSecretLikeKey(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return secretLikeKeys.some((secretKey) =>
    normalizedKey.includes(secretKey.toLowerCase())
  );
}

function looksLikeSecretValue(value: string): boolean {
  return /(?:sk-[a-z0-9_-]{8,}|api[_-]?key|secret|token|bearer\s+)/i.test(value);
}
