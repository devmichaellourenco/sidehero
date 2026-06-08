import { UpgradeLevels } from '../../domain/upgrades/FeatureKey';

export const TICK_ALARM = 'taskbar-hero-tick';

const TICK_INTERVAL_LEVEL_1_MINUTES = 0.1;
const TICK_INTERVAL_LEVEL_2_MINUTES = 0.05;

export function resolveBackgroundTickPeriodMinutes(levels: UpgradeLevels): number | null {
  const level = levels.background_tick ?? 0;
  if (level < 1) return null;
  return level >= 2 ? TICK_INTERVAL_LEVEL_2_MINUTES : TICK_INTERVAL_LEVEL_1_MINUTES;
}

export async function syncBackgroundTickAlarm(levels: UpgradeLevels): Promise<void> {
  const period = resolveBackgroundTickPeriodMinutes(levels);

  if (period === null) {
    await chrome.alarms.clear(TICK_ALARM);
    return;
  }

  const existing = await chrome.alarms.get(TICK_ALARM);
  if (existing?.periodInMinutes === period) return;

  await chrome.alarms.clear(TICK_ALARM);
  await chrome.alarms.create(TICK_ALARM, { periodInMinutes: period });
}
