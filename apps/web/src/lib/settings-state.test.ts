import { describe, expect, it } from "vitest";
import {
  createDefaultSettings,
  loadSettings,
  normalizeSettings,
  saveSettings,
  serializeSettings,
  settingsStorageKey
} from "./settings-state";
import { readStorageValue } from "./storage";

describe("settings state", () => {
  it("creates defaults", () => {
    const settings = createDefaultSettings();

    expect(settings.mode).toBe("hybrid");
    expect(settings.providerPreferences.prompt).toBe("auto");
    expect(settings.allowMockFallback).toBe(true);
  });

  it("normalizes invalid stored settings safely", () => {
    const settings = normalizeSettings({ mode: "invalid", allowMockFallback: false });

    expect(settings.mode).toBe("hybrid");
    expect(settings.allowMockFallback).toBe(false);
  });

  it("serializes without raw secret-looking values while preserving secret refs", () => {
    const settings = {
      ...createDefaultSettings(),
      apiProviders: [
        {
          ...getDefaultApiProvider(),
          secretRef: "primary-api-key"
        }
      ]
    };
    const serialized = serializeSettings({
      ...settings,
      apiProviders: [
        {
          ...getFirstProvider(settings.apiProviders),
          baseUrl: "https://example.invalid",
          secretRef: "primary-api-key"
        }
      ]
    });

    expect(serialized).toContain("primary-api-key");
    expect(serialized).not.toContain("sk-secret-value");
  });

  it("persists settings to provided storage", () => {
    const storage = new MemoryStorage();
    const settings = createDefaultSettings();

    expect(saveSettings(settings, storage)).toBe(true);
    expect(readStorageValue(settingsStorageKey, storage)).toContain('"mode"');
    expect(loadSettings(storage).mode).toBe(settings.mode);
  });
});

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function getDefaultApiProvider() {
  return getFirstProvider(createDefaultSettings().apiProviders);
}

function getFirstProvider<T>(providers: T[]): T {
  const provider = providers[0];

  if (!provider) {
    throw new Error("Expected provider.");
  }

  return provider;
}
