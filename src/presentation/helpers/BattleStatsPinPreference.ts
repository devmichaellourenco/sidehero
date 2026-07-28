/** Preferência compartilhada: Stats fixo no side panel vs janela popup. */

export const BATTLE_STATS_PINNED_KEY = 'sidehero_battle_stats_pinned';
/** Timestamp para o side panel reagir e abrir o sheet ao fixar a partir do popup. */
export const BATTLE_STATS_DOCK_REQUEST_KEY = 'sidehero_battle_stats_dock_at';

export function isBattleStatsPinnedValue(value: unknown): boolean {
  return value === true;
}

export async function readBattleStatsPinned(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(BATTLE_STATS_PINNED_KEY);
    return isBattleStatsPinnedValue(result[BATTLE_STATS_PINNED_KEY]);
  } catch {
    return false;
  }
}

export async function writeBattleStatsPinned(pinned: boolean): Promise<void> {
  try {
    await chrome.storage.local.set({ [BATTLE_STATS_PINNED_KEY]: pinned });
  } catch {
    // storage indisponível
  }
}

/** Marca como fixado e pede ao side panel para abrir o sheet. */
export async function requestDockBattleStatsToSidePanel(): Promise<void> {
  try {
    await chrome.storage.local.set({
      [BATTLE_STATS_PINNED_KEY]: true,
      [BATTLE_STATS_DOCK_REQUEST_KEY]: Date.now(),
    });
  } catch {
    // storage indisponível
  }
}
