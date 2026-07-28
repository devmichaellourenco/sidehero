/** Decide se reaproveita o id de janela já aberto. */
export function resolveReusableWindowId(
  trackedId: number | null,
  openWindowIds: readonly number[],
): number | null {
  if (trackedId == null) return null;
  return openWindowIds.includes(trackedId) ? trackedId : null;
}

/** Base original 400×640 + 30%. */
export const BATTLE_STATS_WINDOW_WIDTH = Math.round(400 * 1.3);
export const BATTLE_STATS_WINDOW_HEIGHT = Math.round(640 * 1.3);

export function getBattleStatsWindowFixedSize(): { width: number; height: number } {
  return {
    width: BATTLE_STATS_WINDOW_WIDTH,
    height: BATTLE_STATS_WINDOW_HEIGHT,
  };
}

export function isBattleStatsWindowSizeLocked(
  width: number | undefined,
  height: number | undefined,
): boolean {
  return width === BATTLE_STATS_WINDOW_WIDTH && height === BATTLE_STATS_WINDOW_HEIGHT;
}

export function getBattleStatsWindowCreateOptions(url: string): chrome.windows.CreateData {
  const size = getBattleStatsWindowFixedSize();
  return {
    url,
    type: 'popup',
    width: size.width,
    height: size.height,
    focused: true,
  };
}
