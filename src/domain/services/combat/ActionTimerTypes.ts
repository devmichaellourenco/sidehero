import { MIN_ACTION_INTERVAL_SECONDS } from '../../combat/CombatTimingConstants';

export interface ActionTimerEntry {
  remaining: number;
  total: number;
}

export type ActionTimerMap = Record<string, ActionTimerEntry>;

export function normalizeActionTimerEntry(value: unknown): ActionTimerEntry {
  if (typeof value === 'number') {
    const remaining = value;
    const total = remaining > 0 ? remaining : MIN_ACTION_INTERVAL_SECONDS;
    return { remaining, total };
  }

  if (
    value &&
    typeof value === 'object' &&
    typeof (value as ActionTimerEntry).remaining === 'number' &&
    typeof (value as ActionTimerEntry).total === 'number'
  ) {
    const entry = value as ActionTimerEntry;
    return {
      remaining: entry.remaining,
      total: Math.max(entry.total, MIN_ACTION_INTERVAL_SECONDS),
    };
  }

  return { remaining: 0, total: MIN_ACTION_INTERVAL_SECONDS };
}

export function normalizeActionTimerMap(value: unknown): ActionTimerMap {
  if (!value || typeof value !== 'object') return {};

  const next: ActionTimerMap = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    next[key] = normalizeActionTimerEntry(entry);
  }
  return next;
}

export function resolveActionTimeRatio(entry: ActionTimerEntry | undefined): number {
  if (!entry || entry.total <= 0) return 1;
  if (entry.remaining <= 0) return 1;
  return Math.max(0, Math.min(1, 1 - entry.remaining / entry.total));
}
