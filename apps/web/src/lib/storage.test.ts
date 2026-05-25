import { describe, expect, it } from "vitest";
import {
  appendExportHistory,
  clearProjectStorage,
  projectJsonStorageKey,
  readExportHistory,
  readStorageValue,
  selectedFileStorageKey,
  writeStorageValue
} from "./storage";

describe("storage helpers", () => {
  it("reads and writes storage values safely", () => {
    const storage = new MemoryStorage();

    expect(writeStorageValue(projectJsonStorageKey, "{}", storage)).toBe(true);
    expect(readStorageValue(projectJsonStorageKey, storage)).toBe("{}");
  });

  it("stores bounded export history", () => {
    const storage = new MemoryStorage();

    appendExportHistory(
      { id: "one", fileCount: 7, createdAt: "2026-01-01T00:00:00.000Z" },
      storage
    );

    expect(readExportHistory(storage)).toEqual([
      { id: "one", fileCount: 7, createdAt: "2026-01-01T00:00:00.000Z" }
    ]);
  });

  it("clears project storage keys", () => {
    const storage = new MemoryStorage();
    writeStorageValue(projectJsonStorageKey, "{}", storage);
    writeStorageValue(selectedFileStorageKey, "index.html", storage);

    clearProjectStorage(storage);

    expect(readStorageValue(projectJsonStorageKey, storage)).toBeNull();
    expect(readStorageValue(selectedFileStorageKey, storage)).toBeNull();
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
