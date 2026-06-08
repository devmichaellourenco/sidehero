import { GameStateDto } from '../../application/dto/GameStateDto';
import { FeatureKey, getFeatureLevel, UpgradeLevels } from '../../domain/upgrades/FeatureKey';

export class FeatureGate {
  static getLevel(state: GameStateDto | null, feature: FeatureKey): number {
    if (!state) return 0;
    return getFeatureLevel(state.upgradeLevels, feature);
  }

  static hasLevel(levels: UpgradeLevels, feature: FeatureKey, minLevel: number): boolean {
    return getFeatureLevel(levels, feature) >= minLevel;
  }

  static canUseAutoBattle(state: GameStateDto | null): boolean {
    return this.getLevel(state, 'auto_battle') >= 1;
  }

  static maxAutoBattleSpeed(state: GameStateDto | null): 1 | 2 | 3 {
    const level = this.getLevel(state, 'auto_battle');
    if (level >= 3) return 3;
    if (level >= 2) return 2;
    return 1;
  }

  static canUseAutoOpenChests(state: GameStateDto | null): boolean {
    return this.getLevel(state, 'auto_open_chests') >= 1;
  }

  static canUseOpenAllChests(state: GameStateDto | null): boolean {
    return this.getLevel(state, 'open_all_chests') >= 1;
  }

  static shouldAutoOpenAllChests(state: GameStateDto | null): boolean {
    const level = this.getLevel(state, 'open_all_chests');
    return level >= 2;
  }

  static canUseOptimizeLoadout(state: GameStateDto | null): boolean {
    return this.getLevel(state, 'optimize_loadout') >= 1;
  }

  static canUseOptimizeInLootBatch(state: GameStateDto | null): boolean {
    return this.getLevel(state, 'optimize_loadout') >= 2;
  }

  static canUseAutoEquipLoot(state: GameStateDto | null): boolean {
    return this.getLevel(state, 'auto_equip_loot') >= 1;
  }

  static isAutoEquipSilent(state: GameStateDto | null): boolean {
    return this.getLevel(state, 'auto_equip_loot') >= 2;
  }

  static canUseLogFilter(state: GameStateDto | null): boolean {
    return this.getLevel(state, 'log_filter') >= 1;
  }

  static canUseShopRefresh(state: GameStateDto | null): boolean {
    return this.getLevel(state, 'shop_refresh') >= 1;
  }

  static canUseBackgroundTick(levels: UpgradeLevels): boolean {
    return getFeatureLevel(levels, 'background_tick') >= 1;
  }

  static backgroundTickMultiplier(levels: UpgradeLevels): number {
    return getFeatureLevel(levels, 'background_tick') >= 2 ? 2 : 1;
  }
}
