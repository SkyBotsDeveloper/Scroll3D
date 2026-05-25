export const projectJsonStorageKey = "scroll3d.projectJson";
export const selectedFileStorageKey = "scroll3d.selectedFile";
export const exportHistoryStorageKey = "scroll3d.exportHistory";

export interface ExportHistoryItem {
  id: string;
  fileCount: number;
  createdAt: string;
}

export function readStorageValue(
  key: string,
  storage: Storage | null | undefined = getBrowserStorage()
): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorageValue(
  key: string,
  value: string,
  storage: Storage | null | undefined = getBrowserStorage()
): boolean {
  try {
    storage?.setItem(key, value);

    return Boolean(storage);
  } catch {
    return false;
  }
}

export function removeStorageValue(
  key: string,
  storage: Storage | null | undefined = getBrowserStorage()
): boolean {
  try {
    storage?.removeItem(key);

    return Boolean(storage);
  } catch {
    return false;
  }
}

export function readExportHistory(
  storage: Storage | null | undefined = getBrowserStorage()
): ExportHistoryItem[] {
  const value = readStorageValue(exportHistoryStorageKey, storage);

  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value) as unknown;

    return Array.isArray(parsed) ? parsed.filter(isExportHistoryItem).slice(0, 10) : [];
  } catch {
    return [];
  }
}

export function appendExportHistory(
  item: ExportHistoryItem,
  storage: Storage | null | undefined = getBrowserStorage()
): ExportHistoryItem[] {
  const nextHistory = [item, ...readExportHistory(storage)].slice(0, 10);
  writeStorageValue(exportHistoryStorageKey, JSON.stringify(nextHistory), storage);

  return nextHistory;
}

export function clearProjectStorage(
  storage: Storage | null | undefined = getBrowserStorage()
): void {
  removeStorageValue(projectJsonStorageKey, storage);
  removeStorageValue(selectedFileStorageKey, storage);
  removeStorageValue(exportHistoryStorageKey, storage);
}

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function isExportHistoryItem(value: unknown): value is ExportHistoryItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.fileCount === "number" &&
    typeof candidate.createdAt === "string"
  );
}
