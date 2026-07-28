import {
  getBattleStatsWindowCreateOptions,
  getBattleStatsWindowFixedSize,
  isBattleStatsWindowSizeLocked,
  resolveReusableWindowId,
} from './BattleStatsWindowManager';

let statsWindowId: number | null = null;
let isClampingBounds = false;

export function getTrackedBattleStatsWindowId(): number | null {
  return statsWindowId;
}

export function clearTrackedBattleStatsWindowId(windowId: number): void {
  if (statsWindowId === windowId) {
    statsWindowId = null;
  }
}

async function enforceFixedBattleStatsWindowSize(windowId: number): Promise<void> {
  const size = getBattleStatsWindowFixedSize();
  await chrome.windows.update(windowId, {
    width: size.width,
    height: size.height,
  });
}

/** Abre ou foca a janela popup de Estatísticas. */
export async function openOrFocusBattleStatsWindow(): Promise<number | null> {
  if (statsWindowId != null) {
    try {
      const existing = await chrome.windows.getAll();
      const reusable = resolveReusableWindowId(
        statsWindowId,
        existing.map((window) => window.id).filter((id): id is number => typeof id === 'number'),
      );
      if (reusable != null) {
        await chrome.windows.update(reusable, {
          focused: true,
          ...getBattleStatsWindowFixedSize(),
        });
        return reusable;
      }
      statsWindowId = null;
    } catch {
      statsWindowId = null;
    }
  }

  const url = chrome.runtime.getURL('panel/stats.html');
  const created = await chrome.windows.create(getBattleStatsWindowCreateOptions(url));
  statsWindowId = created.id ?? null;
  return statsWindowId;
}

/** Fecha a janela popup de Estatísticas, se existir. */
export async function closeBattleStatsWindow(): Promise<void> {
  if (statsWindowId == null) return;
  const id = statsWindowId;
  statsWindowId = null;
  try {
    await chrome.windows.remove(id);
  } catch {
    // já fechada
  }
}

export function registerBattleStatsWindowLifecycle(): void {
  chrome.windows.onRemoved.addListener((windowId) => {
    clearTrackedBattleStatsWindowId(windowId);
  });

  // Chrome não expõe `resizable: false` em popups de extensão — trava o tamanho.
  chrome.windows.onBoundsChanged.addListener((window) => {
    if (window.id == null || window.id !== statsWindowId || isClampingBounds) return;
    if (isBattleStatsWindowSizeLocked(window.width, window.height)) return;

    isClampingBounds = true;
    void enforceFixedBattleStatsWindowSize(window.id)
      .catch(() => undefined)
      .finally(() => {
        isClampingBounds = false;
      });
  });
}
