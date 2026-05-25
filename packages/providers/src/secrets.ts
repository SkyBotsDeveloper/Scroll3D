import type { ProviderSecretRef, ProviderSecretStore } from "./types";

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

export class InMemorySecretStore implements ProviderSecretStore {
  private readonly secrets = new Map<string, string>();

  setSecret(ref: ProviderSecretRef | string, value: string): void {
    this.secrets.set(getSecretId(ref), value);
  }

  getSecret(ref: ProviderSecretRef | string): string | undefined {
    return this.secrets.get(getSecretId(ref));
  }

  deleteSecret(ref: ProviderSecretRef | string): boolean {
    return this.secrets.delete(getSecretId(ref));
  }

  hasSecret(ref: ProviderSecretRef | string): boolean {
    return this.secrets.has(getSecretId(ref));
  }

  listSecretRefs(): ProviderSecretRef[] {
    return Array.from(this.secrets.keys()).map((id) => ({ id }));
  }

  toJSON(): { secrets: Array<ProviderSecretRef & { value: "[redacted]" }> } {
    return {
      secrets: this.listSecretRefs().map((ref) => ({
        ...ref,
        value: "[redacted]"
      }))
    };
  }
}

export function getSecretId(ref: ProviderSecretRef | string): string {
  return typeof ref === "string" ? ref : ref.id;
}

export function redactSecrets(
  value: unknown,
  secretValues: readonly string[] = []
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item, secretValues));
  }

  if (value && typeof value === "object") {
    const redacted: Record<string, unknown> = {};

    for (const [key, childValue] of Object.entries(value)) {
      if (isSecretLikeKey(key)) {
        redacted[key] = redactSecretRef(childValue);
      } else {
        redacted[key] = redactSecrets(childValue, secretValues);
      }
    }

    return redacted;
  }

  if (typeof value === "string") {
    return redactString(value, secretValues);
  }

  return value;
}

export function serializeSecretSafe(
  value: unknown,
  secretStore?: ProviderSecretStore
): unknown {
  const secretValues = secretStore
    ? secretStore
        .listSecretRefs()
        .map((ref) => secretStore.getSecret(ref))
        .filter((secret): secret is string => typeof secret === "string")
    : [];

  return redactSecrets(value, secretValues);
}

function redactSecretRef(value: unknown): unknown {
  if (value && typeof value === "object" && "id" in value) {
    return {
      id: String(value.id),
      value: "[redacted]"
    };
  }

  return "[redacted]";
}

function isSecretLikeKey(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return secretLikeKeys.some((secretKey) =>
    normalizedKey.includes(secretKey.toLowerCase())
  );
}

function redactString(value: string, secretValues: readonly string[]): string {
  return secretValues.reduce(
    (currentValue, secretValue) =>
      secretValue.length > 0
        ? currentValue.replaceAll(secretValue, "[redacted]")
        : currentValue,
    value
  );
}
