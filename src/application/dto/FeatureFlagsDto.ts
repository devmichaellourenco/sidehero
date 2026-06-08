export interface FeatureFlagsDto {
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
