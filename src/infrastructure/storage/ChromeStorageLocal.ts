type ChromeStorageArea = {
  get(keys: string | string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  getBytesInUse?(keys?: string | string[] | null): Promise<number>;
};

function storageArea(): ChromeStorageArea {
  return chrome.storage.local;
}

export function formatChromeStorageError(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('no_space') ||
    normalized.includes('quota_bytes') ||
    normalized.includes('quota_exceeded')
  ) {
    return 'Sem espaço para salvar o progresso. Libere espaço no disco do Windows/WSL e tente novamente.';
  }

  return message;
}

export async function chromeStorageSet(items: Record<string, unknown>): Promise<void> {
  try {
    await storageArea().set(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(formatChromeStorageError(message));
  }

  const runtimeError = chrome.runtime?.lastError;
  if (runtimeError?.message) {
    throw new Error(formatChromeStorageError(runtimeError.message));
  }
}

export async function chromeStorageGet(keys: string | string[]): Promise<Record<string, unknown>> {
  return storageArea().get(keys);
}

export async function chromeStorageRemove(keys: string | string[]): Promise<void> {
  await storageArea().remove(keys);
}

export async function chromeStorageBytesInUse(keys?: string | string[] | null): Promise<number | null> {
  const getBytesInUse = storageArea().getBytesInUse;
  if (!getBytesInUse) return null;

  try {
    return await getBytesInUse.call(storageArea(), keys ?? null);
  } catch {
    return null;
  }
}
