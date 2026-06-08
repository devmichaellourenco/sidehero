import { GameState } from '../../domain/entities/GameState';
import { Gear } from '../../domain/entities/Gear';
import { Chest } from '../../domain/entities/Chest';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { mapChestProgress } from '../mappers/ChestProgressMapper';
import { mapFeatureFlags } from '../mappers/FeatureFlagsMapper';
import { mapHeroToDto } from '../mappers/HeroDtoMapper';
import { mapGearToDto } from '../mappers/GearDtoMapper';
import { ChestDto, GameStateDto } from '../dto/GameStateDto';
import { getShopRefreshLimit } from '../../domain/upgrades/ShopRefreshRules';

export class GameStatePresenter {
  constructor(private readonly upgradeService: UpgradeService) {}

  present(state: GameState): GameStateDto {
    const upgradeLevels = { ...state.upgradeLevels };

    return {
      heroes: state.heroes.map(mapHeroToDto),
      enemy: state.currentEnemy
        ? {
            id: state.currentEnemy.id,
            name: state.currentEnemy.name,
            enemyType: state.currentEnemy.enemyType,
            health: state.currentEnemy.stats.currentHealth,
            maxHealth: state.currentEnemy.stats.maxHealth,
            attack: state.currentEnemy.stats.attack,
            defense: state.currentEnemy.stats.defense,
            goldReward: state.currentEnemy.goldReward,
            xpReward: state.currentEnemy.xpReward,
          }
        : null,
      stage: state.stage,
      gold: state.gold.value(),
      chests: state.chests.map(mapChestToDto),
      inventory: state.inventory.map(mapGearToDto),
      battleLog: state.battleLog,
      totalBattlesWon: state.totalBattlesWon,
      pendingChestCount: state.pendingChests().length,
      upgradeLevels,
      shopRefreshUses: state.shopRefreshUses,
      shopRefreshLimit: getShopRefreshLimit(state.upgradeLevels),
      purchasableUpgradeCount: this.upgradeService.countAvailable(state),
      featureFlags: mapFeatureFlags(state.upgradeLevels),
      chestProgress: mapChestProgress(state.totalBattlesWon),
    };
  }
}

function mapChestToDto(chest: Chest): ChestDto {
  return {
    id: chest.id,
    stageEarned: chest.stageEarned,
    opened: chest.opened,
  };
}
