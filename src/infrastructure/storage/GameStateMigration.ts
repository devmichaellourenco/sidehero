import { createAttributes } from '../../domain/progression/Attributes';
import { BASIC_ATTACK_SKILL_ID } from '../../domain/progression/combat/BasicAttackSkill';
import { MAX_ACTIVE_BATTLE_SKILLS } from '../../domain/progression/SkillBattleSlots';
import { AscensionId, SkillId } from '../../domain/progression/SkillId';
import { Experience } from '../../domain/value-objects/Experience';
import { Stats } from '../../domain/value-objects/Stats';
import { Gear, GearSlot } from '../../domain/entities/Gear';
import { Hero, HeroProps } from '../../domain/entities/Hero';
import { Enemy, EnemyProps } from '../../domain/entities/Enemy';
import { inferEnemyType } from '../../domain/entities/EnemyType';
import { Chest, ChestProps } from '../../domain/entities/Chest';
import { CombatState } from '../../domain/entities/CombatState';
import { TurnOrderService } from '../../domain/services/combat/TurnOrderService';

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value !== null && typeof value === 'object' ? (value as RawRecord) : {};
}

function migrateEquipment(raw: unknown): HeroProps['equipment'] {
  const entries = Object.entries(asRecord(raw));
  return Object.fromEntries(
    entries.map(([slot, gear]) => [
      slot as GearSlot,
      gear && typeof gear === 'object' ? Gear.create(gear as Parameters<typeof Gear.create>[0]) : null,
    ]),
  );
}

function migrateAttributes(raw: unknown): HeroProps['allocatedAttributes'] {
  const attrs = asRecord(raw);
  return createAttributes(
    typeof attrs.str === 'number' ? attrs.str : 0,
    typeof attrs.dex === 'number' ? attrs.dex : 0,
    typeof attrs.int === 'number' ? attrs.int : 0,
  );
}

function migrateSkillRanks(raw: unknown): Record<SkillId, number> {
  const ranks = asRecord(raw);
  return Object.fromEntries(
    Object.entries(ranks)
      .filter(([, value]) => typeof value === 'number' && value > 0)
      .map(([id, value]) => [id, value as number]),
  );
}

function migrateEquippedSkillIds(raw: unknown): SkillId[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((id): id is SkillId => typeof id === 'string')
    .slice(0, MAX_ACTIVE_BATTLE_SKILLS);
}

function migrateStarterBattleSkill(
  skillRanks: Record<SkillId, number>,
  equippedSkillIds: SkillId[],
): { skillRanks: Record<SkillId, number>; equippedSkillIds: SkillId[] } {
  const ranks = { ...skillRanks };
  if ((ranks[BASIC_ATTACK_SKILL_ID] ?? 0) < 1) {
    ranks[BASIC_ATTACK_SKILL_ID] = 1;
  }

  const withoutBasic = equippedSkillIds.filter((id) => id !== BASIC_ATTACK_SKILL_ID);
  const equipped = [BASIC_ATTACK_SKILL_ID, ...withoutBasic].slice(0, MAX_ACTIVE_BATTLE_SKILLS);

  return { skillRanks: ranks, equippedSkillIds: equipped };
}

function migrateProgression(raw: RawRecord): Pick<
  HeroProps,
  | 'allocatedAttributes'
  | 'unspentImprovementPoints'
  | 'unspentAscensionPoints'
  | 'skillRanks'
  | 'equippedSkillIds'
  | 'ascensionId'
> {
  const starter = migrateStarterBattleSkill(
    migrateSkillRanks(raw.skillRanks),
    migrateEquippedSkillIds(raw.equippedSkillIds),
  );

  return {
    allocatedAttributes: migrateAttributes(raw.allocatedAttributes),
    unspentImprovementPoints:
      typeof raw.unspentImprovementPoints === 'number' ? raw.unspentImprovementPoints : 0,
    unspentAscensionPoints:
      typeof raw.unspentAscensionPoints === 'number' ? raw.unspentAscensionPoints : 0,
    skillRanks: starter.skillRanks,
    equippedSkillIds: starter.equippedSkillIds,
    ascensionId:
      typeof raw.ascensionId === 'string' ? (raw.ascensionId as AscensionId) : null,
  };
}

function migrateExperience(raw: unknown): Experience {
  const exp = asRecord(raw);
  return Experience.restore(
    typeof exp.current === 'number' ? exp.current : 0,
    typeof exp.toNextLevel === 'number' ? exp.toNextLevel : 100,
    typeof exp.level === 'number' ? exp.level : 1,
  );
}

export function migrateHero(raw: unknown): Hero {
  const h = asRecord(raw);

  if (typeof h.id !== 'string' || typeof h.name !== 'string' || typeof h.heroClass !== 'string') {
    throw new Error('Herói inválido no storage');
  }

  const experience = migrateExperience(h.experience);
  const equipment = migrateEquipment(h.equipment);

  const progression = migrateProgression(h);

  if (typeof h.baseAttack === 'number') {
    return Hero.restore({
      id: h.id,
      name: h.name,
      heroClass: h.heroClass as HeroProps['heroClass'],
      baseAttack: h.baseAttack,
      baseDefense: typeof h.baseDefense === 'number' ? h.baseDefense : 5,
      baseMaxHealth: typeof h.baseMaxHealth === 'number' ? h.baseMaxHealth : 100,
      currentHealth: typeof h.currentHealth === 'number' ? h.currentHealth : 100,
      experience,
      equipment,
      ...progression,
    });
  }

  const stats = asRecord(h.stats);
  return Hero.restore({
    id: h.id,
    name: h.name,
    heroClass: h.heroClass as HeroProps['heroClass'],
    baseAttack: typeof stats.attack === 'number' ? stats.attack : 10,
    baseDefense: typeof stats.defense === 'number' ? stats.defense : 5,
    baseMaxHealth: typeof stats.maxHealth === 'number' ? stats.maxHealth : 100,
    currentHealth:
      typeof stats.currentHealth === 'number'
        ? stats.currentHealth
        : typeof stats.maxHealth === 'number'
          ? stats.maxHealth
          : 100,
    experience,
    equipment,
    ...progression,
  });
}

export function migrateEnemy(raw: unknown): Enemy | null {
  if (!raw || typeof raw !== 'object') return null;

  const e = raw as EnemyProps;
  const statsRaw = asRecord(e.stats);

  const stage = typeof e.stage === 'number' ? e.stage : 1;
  const name = typeof e.name === 'string' ? e.name : `Slime Lv.${stage}`;

  return Enemy.restore({
    id: e.id,
    name,
    enemyType:
      typeof e.enemyType === 'string'
        ? (e.enemyType as EnemyProps['enemyType'])
        : inferEnemyType(name, stage),
    stage,
    stats: Stats.create({
      attack: typeof statsRaw.attack === 'number' ? statsRaw.attack : 10,
      defense: typeof statsRaw.defense === 'number' ? statsRaw.defense : 4,
      maxHealth: typeof statsRaw.maxHealth === 'number' ? statsRaw.maxHealth : 60,
      currentHealth:
        typeof statsRaw.currentHealth === 'number'
          ? statsRaw.currentHealth
          : typeof statsRaw.maxHealth === 'number'
            ? statsRaw.maxHealth
            : 60,
    }),
    goldReward: e.goldReward,
    xpReward: e.xpReward,
  });
}

export function migrateCombat(
  raw: unknown,
  heroes: Hero[],
  legacyEnemy: Enemy | null,
): CombatState | null {
  if (raw && typeof raw === 'object') {
    const combat = asRecord(raw);
    const enemiesRaw = Array.isArray(combat.enemies) ? combat.enemies : [];
    const enemies = enemiesRaw
      .map((enemy) => migrateEnemy(enemy))
      .filter((enemy): enemy is Enemy => enemy !== null);

    if (enemies.length > 0) {
      return CombatState.restore({
        enemies: enemies.map((enemy) => enemy.toProps()),
        turnQueue: Array.isArray(combat.turnQueue)
          ? (combat.turnQueue as CombatState['turnQueue'])
          : [],
        turnIndex: typeof combat.turnIndex === 'number' ? combat.turnIndex : 0,
        round: typeof combat.round === 'number' ? combat.round : 1,
        skillCooldowns:
          combat.skillCooldowns && typeof combat.skillCooldowns === 'object'
            ? (combat.skillCooldowns as CombatState['skillCooldowns'])
            : {},
        statusEffects:
          combat.statusEffects && typeof combat.statusEffects === 'object'
            ? (combat.statusEffects as CombatState['statusEffects'])
            : {},
      });
    }
  }

  if (!legacyEnemy) return null;

  const turnOrder = new TurnOrderService();
  return CombatState.fromLegacyEnemy(legacyEnemy, heroes, turnOrder);
}

export function migrateChest(raw: unknown): Chest {
  const c = raw as ChestProps;
  return Chest.restore({
    id: c.id,
    stageEarned: c.stageEarned,
    opened: Boolean(c.opened),
    loot: c.loot && typeof c.loot === 'object' ? Gear.create(c.loot) : null,
  });
}

export function migrateGear(raw: unknown): Gear {
  return Gear.create(raw as Parameters<typeof Gear.create>[0]);
}
