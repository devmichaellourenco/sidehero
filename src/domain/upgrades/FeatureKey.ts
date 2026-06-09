export const FEATURE_KEYS = [
  'auto_battle',
  'background_tick',
  'auto_open_chests',
  'open_all_chests',
  'optimize_loadout',
  'auto_equip_loot',
  'log_filter',
  'shop_refresh',
  'battle_skill_slots',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type UpgradeLevels = Partial<Record<FeatureKey, number>>;

export function getFeatureLevel(levels: UpgradeLevels, feature: FeatureKey): number {
  return levels[feature] ?? 0;
}
