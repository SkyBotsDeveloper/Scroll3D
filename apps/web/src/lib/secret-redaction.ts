const secretLikeKeys = ["apiKey", "apikey", "token", "secret", "password", "bearer"];

export function redactSecretValue(value: string): string {
  if (!value) {
    return "";
  }

  if (value.length <= 4) {
    return "[redacted]";
  }

  return `${value.slice(0, 2)}...${value.slice(-2)}`;
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

  if (typeof value === "string" && looksLikeSecret(value)) {
    return "[redacted]";
  }

  return value;
}

export function isSecretRef(value: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{2,}$/i.test(value.trim());
}

function isSecretLikeKey(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  if (normalizedKey === "secretref") {
    return false;
  }

  return secretLikeKeys.some((secretKey) => normalizedKey.includes(secretKey));
}

function looksLikeSecret(value: string): boolean {
  return /(?:sk-[a-z0-9_-]{8,}|bearer\s+)/i.test(value);
}
