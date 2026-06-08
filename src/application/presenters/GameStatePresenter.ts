import { GameState } from '../../domain/entities/GameState';
import { Enemy } from '../../domain/entities/Enemy';
import { Gear } from '../../domain/entities/Gear';
import { Chest } from '../../domain/entities/Chest';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { mapChestProgress } from '../mappers/ChestProgressMapper';
import { mapFeatureFlags } from '../mappers/FeatureFlagsMapper';
import { mapHeroToDto } from '../mappers/HeroDtoMapper';
import { mapGearToDto } from '../mappers/GearDtoMapper';
import { buildInventoryUpgradeHints } from '../mappers/GearUpgradePreviewMapper';
import { ChestDto, EnemyDto, GameStateDto } from '../dto/GameStateDto';
import { getShopRefreshLimit } from '../../domain/upgrades/ShopRefreshRules';

export class GameStatePresenter {
  constructor(private readonly upgradeService: UpgradeService) {}

  present(state: GameState): GameStateDto {
    const upgradeLevels = { ...state.upgradeLevels };
    const enemies = (state.combat?.enemies ?? []).map(mapEnemyToDto);
    const activeActor = state.combat?.currentActor() ?? null;

    return {
      heroes: state.heroes.map(mapHeroToDto),
      enemies,
      enemy: enemies[0] ?? null,
      activeTurn: activeActor ? { side: activeActor.side, id: activeActor.id } : null,
      combatRound: state.combat?.round ?? 1,
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
      gearUpgradeHints: buildInventoryUpgradeHints(state),
    };
  }
}

function mapEnemyToDto(enemy: Enemy): EnemyDto {
  return {
    id: enemy.id,
    name: enemy.name,
    enemyType: enemy.enemyType,
    health: enemy.stats.currentHealth,
    maxHealth: enemy.stats.maxHealth,
    attack: enemy.stats.attack,
    defense: enemy.stats.defense,
    goldReward: enemy.goldReward,
    xpReward: enemy.xpReward,
  };
}

function mapChestToDto(chest: Chest): ChestDto {
  return {
    id: chest.id,
    stageEarned: chest.stageEarned,
    opened: chest.opened,
  };
}
