import { GameState } from '../../domain/entities/GameState';
import { Hero } from '../../domain/entities/Hero';
import { Gear } from '../../domain/entities/Gear';
import { Chest } from '../../domain/entities/Chest';

export interface HeroDto {
  id: string;
  name: string;
  heroClass: string;
  emoji: string;
  level: number;
  attack: number;
  defense: number;
  health: number;
  maxHealth: number;
  equipment: Record<
    string,
    {
      id: string;
      name: string;
      slot: string;
      rarity: string;
      attackBonus: number;
      defenseBonus: number;
      healthBonus: number;
    } | null
  >;
}

export interface EnemyDto {
  id: string;
  name: string;
  enemyType: string;
  health: number;
  maxHealth: number;
}

export interface GearDto {
  id: string;
  name: string;
  slot: string;
  rarity: string;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
}

export interface ChestDto {
  id: string;
  stageEarned: number;
  opened: boolean;
}

export interface GameStateDto {
  heroes: HeroDto[];
  enemy: EnemyDto | null;
  stage: number;
  gold: number;
  chests: ChestDto[];
  inventory: GearDto[];
  battleLog: { message: string; timestamp: number }[];
  totalBattlesWon: number;
  pendingChestCount: number;
}

export function mapHeroToDto(hero: Hero): HeroDto {
  const equipment: HeroDto['equipment'] = {};
  const slots = ['weapon', 'armor', 'accessory'] as const;
  const heroEquipment = hero.toProps().equipment ?? {};

  for (const slot of slots) {
    const gear = heroEquipment[slot];
    equipment[slot] = gear
      ? {
          id: gear.id,
          name: gear.name,
          slot: gear.slot,
          rarity: gear.rarity,
          attackBonus: gear.attackBonus,
          defenseBonus: gear.defenseBonus,
          healthBonus: gear.healthBonus,
        }
      : null;
  }

  return {
    id: hero.id,
    name: hero.name,
    heroClass: hero.heroClass,
    emoji: hero.emoji,
    level: hero.level,
    attack: hero.attack,
    defense: hero.defense,
    health: hero.currentHealth,
    maxHealth: hero.maxHealth,
    equipment,
  };
}

export function mapGearToDto(gear: Gear): GearDto {
  return {
    id: gear.id,
    name: gear.name,
    slot: gear.slot,
    rarity: gear.rarity,
    attackBonus: gear.attackBonus,
    defenseBonus: gear.defenseBonus,
    healthBonus: gear.healthBonus,
  };
}

export function mapChestToDto(chest: Chest): ChestDto {
  return {
    id: chest.id,
    stageEarned: chest.stageEarned,
    opened: chest.opened,
  };
}

export function mapGameStateToDto(state: GameState): GameStateDto {
  return {
    heroes: state.heroes.map(mapHeroToDto),
    enemy: state.currentEnemy
      ? {
          id: state.currentEnemy.id,
          name: state.currentEnemy.name,
          enemyType: state.currentEnemy.enemyType,
          health: state.currentEnemy.stats.currentHealth,
          maxHealth: state.currentEnemy.stats.maxHealth,
        }
      : null,
    stage: state.stage,
    gold: state.gold.value(),
    chests: state.chests.map(mapChestToDto),
    inventory: state.inventory.map(mapGearToDto),
    battleLog: state.battleLog,
    totalBattlesWon: state.totalBattlesWon,
    pendingChestCount: state.pendingChests().length,
  };
}
