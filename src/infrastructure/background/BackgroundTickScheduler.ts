import { UpgradeLevels } from '../../domain/upgrades/FeatureKey';

export const TICK_ALARM = 'taskbar-hero-tick';

// OFFLINE PROGRESS DESATIVADO (2026-07): sem aquisição de recursos com painel fechado.
// Para reativar, descomente os intervalos e a lógica original em resolveBackgroundTickPeriodMinutes.
// const TICK_INTERVAL_LEVEL_1_MINUTES = 0.1;
// const TICK_INTERVAL_LEVEL_2_MINUTES = 0.05;

export function resolveBackgroundTickPeriodMinutes(_levels: UpgradeLevels): number | null {
  // Sempre null = sem alarm de tick offline.
  return null;

  // --- original (reativar offline progress) ---
  // const level = levels.background_tick ?? 0;
  // if (level < 1) return null;
  // return level >= 2 ? TICK_INTERVAL_LEVEL_2_MINUTES : TICK_INTERVAL_LEVEL_1_MINUTES;
}

export async function syncBackgroundTickAlarm(levels: UpgradeLevels): Promise<void> {
  const period = resolveBackgroundTickPeriodMinutes(levels);

  // Sempre limpa alarm legado (players que já tinham background_tick comprado).
  if (period === null) {
    await chrome.alarms.clear(TICK_ALARM);
    return;
  }

  // --- original (reativar offline progress) ---
  // const existing = await chrome.alarms.get(TICK_ALARM);
  // if (existing?.periodInMinutes === period) return;
  // await chrome.alarms.clear(TICK_ALARM);
  // await chrome.alarms.create(TICK_ALARM, { periodInMinutes: period });
}
