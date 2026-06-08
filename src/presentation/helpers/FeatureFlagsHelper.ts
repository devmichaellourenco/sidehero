import { FeatureFlagsDto } from '../../application/dto/FeatureFlagsDto';
import { GameStateDto } from '../../application/dto/GameStateDto';

const DEFAULT_FLAGS: FeatureFlagsDto = {
  autoBattle: false,
  autoBattleMaxSpeed: 1,
  autoOpenChests: false,
  openAllChests: false,
  autoOpenAllChests: false,
  optimizeLoadout: false,
  optimizeInLootBatch: false,
  autoEquipLoot: false,
  autoEquipSilent: false,
  logFilter: false,
  shopRefresh: false,
  backgroundTick: false,
  backgroundTickMultiplier: 1,
};

export function getFeatureFlags(state: GameStateDto | null): FeatureFlagsDto {
  return state?.featureFlags ?? DEFAULT_FLAGS;
}
