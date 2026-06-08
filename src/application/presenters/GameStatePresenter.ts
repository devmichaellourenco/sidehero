import { GameState } from '../../domain/entities/GameState';
import { Enemy } from '../../domain/entities/Enemy';
import { Gear } from '../../domain/entities/Gear';
import { Chest } from '../../domain/entities/Chest';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { mapChestProgress } from '../mappers/ChestProgressMapper';
import { mapFeatureFlags } from '../mappers/FeatureFlagsMapper';
import { mapHeroToDto as mapHeroBaseToDto } from '../mappers/HeroDtoMapper';
import { Hero } from '../../domain/entities/Hero';
import { mapGearToDto } from '../mappers/GearDtoMapper';
import { buildInventoryUpgradeHints } from '../mappers/GearUpgradePreviewMapper';
import { ChestDto, EnemyDto, GameStateDto } from '../dto/GameStateDto';
import { getShopRefreshLimit } from '../../domain/upgrades/ShopRefreshRules';
import { listEnemyCombatSkillsByType } from '../../domain/progression/combat/EnemyCombatSkillCatalog';
import { getEnemySkillDisplay } from '../../domain/progression/combat/EnemySkillDisplayCatalog';
import {
  mapEnemyCombatIntent,
  mapHeroCombatIntent,
} from '../mappers/CombatSkillIntentMapper';
import { mapCombatantStatusEffects } from '../mappers/CombatStatusEffectMapper';

export class GameStatePresenter {
  constructor(private readonly upgradeService: UpgradeService) {}

  present(state: GameState): GameStateDto {
    const upgradeLevels = { ...state.upgradeLevels };
    const combat = state.combat;
    const combatEnemies = combat?.enemies ?? [];
    const skillCooldowns = combat?.skillCooldowns;
    const statusEffects = combat?.statusEffects;
    const enemies = combatEnemies.map((enemy) =>
      mapEnemyToDto(enemy, state.heroes, combatEnemies, skillCooldowns, statusEffects),
    );
    const activeActor = combat?.currentActor() ?? null;

    return {
      heroes: state.heroes.map((hero) =>
        mapHeroToDtoWithCombatIntent(
          hero,
          state.heroes,
          combatEnemies,
          skillCooldowns,
          statusEffects,
        ),
      ),
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

function mapHeroToDtoWithCombatIntent(
  hero: Hero,
  party: Hero[],
  enemies: Enemy[],
  skillCooldowns: Parameters<typeof mapHeroCombatIntent>[3],
  combatStatusEffects: Parameters<typeof mapCombatantStatusEffects>[2],
) {
  return {
    ...mapHeroBaseToDto(hero),
    combatIntent: mapHeroCombatIntent(hero, party, enemies, skillCooldowns, combatStatusEffects),
    statusEffects: mapCombatantStatusEffects('hero', hero.id, combatStatusEffects),
  };
}

function mapEnemyToDto(
  enemy: Enemy,
  party: Parameters<typeof mapEnemyCombatIntent>[1],
  enemies: Parameters<typeof mapEnemyCombatIntent>[2],
  skillCooldowns: Parameters<typeof mapEnemyCombatIntent>[3],
  combatStatusEffects: Parameters<typeof mapCombatantStatusEffects>[2],
): EnemyDto {
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
    signatureSkills: listEnemyCombatSkillsByType(enemy.enemyType)
      .filter((skill) => skill.skillId !== 'basic_attack')
      .map((skill) => getEnemySkillDisplay(skill.skillId))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .map((entry) => ({ name: entry.name, description: entry.description })),
    combatIntent: mapEnemyCombatIntent(enemy, party, enemies, skillCooldowns),
    statusEffects: mapCombatantStatusEffects('enemy', enemy.id, combatStatusEffects),
  };
}

function mapChestToDto(chest: Chest): ChestDto {
  return {
    id: chest.id,
    stageEarned: chest.stageEarned,
    opened: chest.opened,
  };
}
