import { UpgradeLevels, getFeatureLevel } from '../upgrades/FeatureKey';

export interface FeatureAccessSnapshot {
  autoBattle: boolean;
  autoBattleMaxSpeed: 1 | 2 | 3;
  autoOpenChests: boolean;
  openAllChests: boolean;
  autoOpenAllChests: boolean;
  optimizeLoadout: boolean;
  optimizeInLootBatch: boolean;
  autoEquipLoot: boolean;
  autoEquipSilent: boolean;
  logFilter: boolean;
  shopRefresh: boolean;
  backgroundTick: boolean;
  backgroundTickMultiplier: number;
}

export class FeatureAccessPolicy {
  static resolve(levels: UpgradeLevels): FeatureAccessSnapshot {
    const autoBattleLevel = getFeatureLevel(levels, 'auto_battle');
    const openAllLevel = getFeatureLevel(levels, 'open_all_chests');
    const optimizeLevel = getFeatureLevel(levels, 'optimize_loadout');
    const autoEquipLevel = getFeatureLevel(levels, 'auto_equip_loot');
    const backgroundTickLevel = getFeatureLevel(levels, 'background_tick');

    return {
      autoBattle: autoBattleLevel >= 1,
      autoBattleMaxSpeed: autoBattleLevel >= 3 ? 3 : autoBattleLevel >= 2 ? 2 : 1,
      autoOpenChests: getFeatureLevel(levels, 'auto_open_chests') >= 1,
      openAllChests: openAllLevel >= 1,
      autoOpenAllChests: openAllLevel >= 2,
      optimizeLoadout: optimizeLevel >= 1,
      optimizeInLootBatch: optimizeLevel >= 2,
      autoEquipLoot: autoEquipLevel >= 1,
      autoEquipSilent: autoEquipLevel >= 2,
      logFilter: getFeatureLevel(levels, 'log_filter') >= 1,
      shopRefresh: getFeatureLevel(levels, 'shop_refresh') >= 1,
      backgroundTick: backgroundTickLevel >= 1,
      backgroundTickMultiplier: backgroundTickLevel >= 2 ? 2 : 1,
    };
  }

  static canUse(levels: UpgradeLevels, feature: keyof FeatureAccessSnapshot): boolean {
    const flags = this.resolve(levels);
    const value = flags[feature];
    return typeof value === 'boolean' ? value : value > 0;
  }
}
