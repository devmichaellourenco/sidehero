import { createAttributes } from '../../domain/progression/Attributes';
import { BASIC_ATTACK_SKILL_ID } from '../../domain/progression/combat/BasicAttackSkill';
import { MAX_ACTIVE_BATTLE_SKILLS } from '../../domain/progression/SkillBattleSlots';
import { AscensionId, SkillId } from '../../domain/progression/SkillId';
import { normalizeAscensionId } from '../../domain/progression/normalizeAscensionId';
import { Experience } from '../../domain/value-objects/Experience';
import { Stats } from '../../domain/value-objects/Stats';
import { Gear, GearProps, GearSlot } from '../../domain/entities/Gear';
import { ActiveGearSlot } from '../../domain/gear/GearSlotCatalog';
import { DEFAULT_GEAR_TEMPLATE_BY_SLOT } from '../../domain/gear/GearTemplateCatalog';
import {
  createGearFromCatalogItem,
  getGearCatalogItem,
  resolveCatalogItemId,
} from '../../domain/gear/GearItemCatalog';
import { Hero, HeroProps } from '../../domain/entities/Hero';
import { Enemy, EnemyProps } from '../../domain/entities/Enemy';
import { EnemyRole } from '../../domain/campaign/WaveDefinition';
import { inferEnemyType, migrateLegacyEnemyType } from '../../domain/entities/EnemyType';
import { Chest, ChestProps } from '../../domain/entities/Chest';
import { CombatState } from '../../domain/entities/CombatState';
import { ActionTimerService } from '../../domain/services/combat/ActionTimerService';
import { normalizeActionTimerMap } from '../../domain/services/combat/ActionTimerTypes';
import { ChestType } from '../../domain/combat/ChestType';

type RawRecord = Record<string, unknown>;

const LEGACY_HERO_NAMES: Record<string, string> = {
  Arthos: 'Galneon',
  Lyra: 'Nix',
};

function migrateHeroName(name: string): string {
  return LEGACY_HERO_NAMES[name] ?? name;
}

function asRecord(value: unknown): RawRecord {
  return value !== null && typeof value === 'object' ? (value as RawRecord) : {};
}

function migrateEquipment(raw: unknown): HeroProps['equipment'] {
  const entries = Object.entries(asRecord(raw));
  return Object.fromEntries(
    entries.map(([slot, gear]) => [
      slot as GearSlot,
      gear && typeof gear === 'object' ? migrateGear(gear) : null,
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

const LEGACY_KNIGHT_SKILL_MAP: Record<string, SkillId> = {
  guardian_strike: 'mil_gen_decree',
  guardian_resolve: 'mil_cap_order',
  reaver_cleave: 'mil_guer_cleave',
  reaver_fury: 'mar_gla_slash',
};

const LEGACY_SORCERER_SKILL_MAP: Record<string, SkillId> = {
  pyro_inferno: 'inn_fei_flame',
  pyro_ember: 'inn_fei_spark',
  arcane_surge: 'arc_mag_bolt',
  arcane_focus: 'arc_mag_weave',
};

function migrateAscensionId(raw: unknown): AscensionId | null {
  if (typeof raw !== 'string') return null;
  return normalizeAscensionId(raw as AscensionId);
}

const LEGACY_PRIEST_SKILL_MAP: Record<string, SkillId> = {
  oracle_mend: 'vid_clr_renew',
  oracle_sanctuary: 'vid_gua_aegis',
  inquisitor_judgment: 'sag_san_judgment',
  inquisitor_flame: 'sag_clr_light',
};

function migrateSkillRanks(raw: unknown): Record<SkillId, number> {
  const ranks = asRecord(raw);
  const migrated = Object.fromEntries(
    Object.entries(ranks)
      .filter(([, value]) => typeof value === 'number' && value > 0)
      .map(([id, value]) => {
        const nextId =
          LEGACY_KNIGHT_SKILL_MAP[id] ??
          LEGACY_SORCERER_SKILL_MAP[id] ??
          LEGACY_PRIEST_SKILL_MAP[id] ??
          id;
        return [nextId, value as number];
      }),
  ) as Record<SkillId, number>;

  return migrated;
}

function migrateEquippedSkillIds(raw: unknown): SkillId[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((id): id is SkillId => typeof id === 'string')
    .map(
      (id) =>
        LEGACY_KNIGHT_SKILL_MAP[id] ??
        LEGACY_SORCERER_SKILL_MAP[id] ??
        LEGACY_PRIEST_SKILL_MAP[id] ??
        id,
    )
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
    ascensionId: migrateAscensionId(raw.ascensionId),
  };
}

function migrateExperience(raw: unknown): Experience {
  const exp = asRecord(raw);
  return Experience.restore(
    typeof exp.current === 'number' ? exp.current : 0,
    typeof exp.toNextLevel === 'number' ? exp.toNextLevel : 0,
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

  const heroName = migrateHeroName(h.name);

  if (typeof h.baseAttack === 'number') {
    return Hero.restore({
      id: h.id,
      name: heroName,
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
    name: heroName,
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

function migrateEnemyRole(role: unknown): EnemyRole {
  if (role === 'boss' || role === 'elite' || role === 'trash') {
    return role;
  }

  return 'trash';
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
        ? migrateLegacyEnemyType(e.enemyType)
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
    role: migrateEnemyRole(e.role),
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
      const actionTimerService = new ActionTimerService();
      const hasActionTimers =
        combat.actionTimers && typeof combat.actionTimers === 'object';

      return CombatState.restore({
        enemies: enemies.map((enemy) => enemy.toProps()),
        actionTimers: hasActionTimers
          ? normalizeActionTimerMap(combat.actionTimers)
          : actionTimerService.createInitial(heroes, enemies),
        combatTime: typeof combat.combatTime === 'number' ? combat.combatTime : 0,
        skillCooldowns:
          combat.skillCooldowns && typeof combat.skillCooldowns === 'object'
            ? (combat.skillCooldowns as CombatState['skillCooldowns'])
            : {},
        statusEffects:
          combat.statusEffects && typeof combat.statusEffects === 'object'
            ? (combat.statusEffects as CombatState['statusEffects'])
            : {},
        encounterMeta:
          combat.encounterMeta && typeof combat.encounterMeta === 'object'
            ? (combat.encounterMeta as CombatState['encounterMeta'])
            : null,
        pendingSkillActions: [],
      });
    }
  }

  if (!legacyEnemy) return null;

  return CombatState.fromLegacyEnemy(legacyEnemy, heroes, new ActionTimerService());
}

export function migrateChest(raw: unknown): Chest {
  const c = asRecord(raw);
  const chestType =
    typeof c.chestType === 'string' ? (c.chestType as ChestType) : 'monster';

  return Chest.restore({
    id: typeof c.id === 'string' ? c.id : `chest-${Date.now()}`,
    stageEarned: typeof c.stageEarned === 'number' ? c.stageEarned : 1,
    chestType,
    opened: Boolean(c.opened),
    loot: c.loot && typeof c.loot === 'object' ? migrateGear(c.loot) : null,
  });
}

export function migrateGear(raw: unknown): Gear {
  const props = { ...(raw as GearProps) };

  if (!props.templateId && props.catalogItemId) {
    props.templateId = getGearCatalogItem(props.catalogItemId)?.spriteId ?? props.catalogItemId;
  }

  if (!props.catalogItemId && typeof props.name === 'string' && props.slot) {
    const catalogId = resolveCatalogItemId(
      props.name,
      props.slot as ActiveGearSlot,
      props.templateId,
      props.rarity,
    );
    if (catalogId) {
      props.catalogItemId = catalogId;
    }
  }

  if (!props.templateId && typeof props.name === 'string' && props.slot) {
    if (props.catalogItemId) {
      props.templateId =
        getGearCatalogItem(props.catalogItemId)?.spriteId ??
        props.catalogItemId ??
        DEFAULT_GEAR_TEMPLATE_BY_SLOT[props.slot as ActiveGearSlot];
    } else {
      const catalogId = resolveCatalogItemId(
        props.name,
        props.slot as ActiveGearSlot,
        undefined,
        props.rarity,
      );
      props.templateId = catalogId
        ? getGearCatalogItem(catalogId)!.spriteId
        : DEFAULT_GEAR_TEMPLATE_BY_SLOT[props.slot as ActiveGearSlot];
    }
  }

  if (props.catalogItemId && getGearCatalogItem(props.catalogItemId)) {
    const instanceId = typeof props.id === 'string' ? props.id : undefined;
    return createGearFromCatalogItem(props.catalogItemId, instanceId);
  }

  return Gear.create(props);
}
