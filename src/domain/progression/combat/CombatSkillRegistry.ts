import { CombatSkillDefinition } from './CombatSkillDefinition';
import { BASIC_ATTACK_SKILL, ENEMY_BASIC_ATTACK_SKILL } from './BasicAttackSkill';
import { HERO_COMBAT_SKILL_CATALOG } from './HeroCombatSkillCatalog';

/** Skills usadas por monstros (podem ser reutilizadas por heróis no futuro). */
const MONSTER_COMBAT_SKILLS: CombatSkillDefinition[] = [
  {
    skillId: 'wild_bite',
    kind: 'damage_physical',
    targetPool: 'heroes',
    targetScope: 'single',
    targetPriority: 'lowest_hp_percent',
    usePriority: 45,
    initialCooldown: 0,
    cooldownTurns: 2,
    basePower: 5,
    powerPerRank: 0,
    attributeFactor: 0,
  },
  {
    skillId: 'goblin_stab',
    kind: 'damage_physical',
    targetPool: 'heroes',
    targetScope: 'single',
    targetPriority: 'lowest_hp_percent',
    usePriority: 55,
    initialCooldown: 0,
    cooldownTurns: 2,
    basePower: 6,
    powerPerRank: 0,
    attributeFactor: 0,
  },
  {
    skillId: 'orc_smash',
    kind: 'damage_physical',
    targetPool: 'heroes',
    targetScope: 'single',
    targetPriority: 'lowest_hp_percent',
    usePriority: 70,
    initialCooldown: 1,
    cooldownTurns: 2,
    basePower: 8,
    powerPerRank: 0,
    attributeFactor: 0,
  },
  {
    skillId: 'poison_spit',
    kind: 'damage_magic',
    targetPool: 'heroes',
    targetScope: 'single',
    targetPriority: 'lowest_hp_percent',
    usePriority: 52,
    initialCooldown: 0,
    cooldownTurns: 2,
    basePower: 5,
    powerPerRank: 0,
    attributeFactor: 0,
  },
  {
    skillId: 'ground_slam',
    kind: 'damage_physical',
    targetPool: 'heroes',
    targetScope: 'all',
    targetPriority: 'lowest_hp_percent',
    usePriority: 75,
    initialCooldown: 1,
    cooldownTurns: 3,
    basePower: 7,
    powerPerRank: 0,
    attributeFactor: 0,
  },
  {
    skillId: 'regenerate',
    kind: 'heal_ally',
    targetPool: 'enemies',
    targetScope: 'single',
    targetPriority: 'lowest_hp_percent',
    usePriority: 60,
    initialCooldown: 2,
    cooldownTurns: 4,
    basePower: 15,
    powerPerRank: 0,
    attributeFactor: 0,
    healConditionThreshold: 0.6,
  },
  {
    skillId: 'slime_acid',
    kind: 'damage_magic',
    targetPool: 'heroes',
    targetScope: 'single',
    targetPriority: 'lowest_hp_percent',
    usePriority: 40,
    initialCooldown: 0,
    cooldownTurns: 2,
    basePower: 4,
    powerPerRank: 0,
    attributeFactor: 0,
  },
  {
    skillId: 'wraith_drain',
    kind: 'damage_magic',
    targetPool: 'heroes',
    targetScope: 'single',
    targetPriority: 'lowest_hp_percent',
    usePriority: 75,
    initialCooldown: 0,
    cooldownTurns: 2,
    basePower: 6,
    powerPerRank: 0,
    attributeFactor: 0,
  },
  {
    skillId: 'wraith_curse',
    kind: 'debuff_defense',
    targetPool: 'heroes',
    targetScope: 'single',
    targetPriority: 'lowest_hp_percent',
    usePriority: 68,
    initialCooldown: 0,
    cooldownTurns: 3,
    basePower: 3,
    powerPerRank: 0,
    attributeFactor: 0,
    effectDurationTurns: 2,
  },
  {
    skillId: 'dragon_breath',
    kind: 'damage_magic',
    targetPool: 'heroes',
    targetScope: 'all',
    targetPriority: 'lowest_hp_percent',
    usePriority: 85,
    initialCooldown: 2,
    cooldownTurns: 3,
    basePower: 12,
    powerPerRank: 0,
    attributeFactor: 0,
  },
  {
    skillId: 'dragon_bite',
    kind: 'damage_physical',
    targetPool: 'heroes',
    targetScope: 'single',
    targetPriority: 'highest_hp_percent',
    usePriority: 80,
    initialCooldown: 0,
    cooldownTurns: 2,
    basePower: 8,
    powerPerRank: 0,
    attributeFactor: 0,
  },
  {
    skillId: 'saci_fire',
    kind: 'damage_magic',
    targetPool: 'heroes',
    targetScope: 'single',
    targetPriority: 'lowest_hp_percent',
    usePriority: 82,
    initialCooldown: 0,
    cooldownTurns: 2,
    basePower: 11,
    powerPerRank: 0,
    attributeFactor: 0,
  },
  {
    skillId: 'saci_wind',
    kind: 'damage_magic',
    targetPool: 'heroes',
    targetScope: 'all',
    targetPriority: 'lowest_hp_percent',
    usePriority: 78,
    initialCooldown: 1,
    cooldownTurns: 3,
    basePower: 7,
    powerPerRank: 0,
    attributeFactor: 0,
  },
];

const REGISTRY = new Map<string, CombatSkillDefinition>();

for (const skill of HERO_COMBAT_SKILL_CATALOG) {
  REGISTRY.set(skill.skillId, skill);
}

for (const skill of MONSTER_COMBAT_SKILLS) {
  REGISTRY.set(skill.skillId, skill);
}

export const ALL_COMBAT_SKILL_IDS = [...REGISTRY.keys()];

export function getBaseCombatSkill(skillId: string): CombatSkillDefinition | undefined {
  return REGISTRY.get(skillId);
}

function flipTargetPool(pool: CombatSkillDefinition['targetPool']): CombatSkillDefinition['targetPool'] {
  if (pool === 'enemies') return 'heroes';
  if (pool === 'heroes') return 'enemies';
  return pool;
}

/** Resolve skill para o lado que a utiliza (herói vs monstro). */
export function resolveCombatSkill(
  skillId: string,
  side: 'hero' | 'enemy',
): CombatSkillDefinition {
  if (skillId === 'basic_attack') {
    return side === 'hero' ? BASIC_ATTACK_SKILL : ENEMY_BASIC_ATTACK_SKILL;
  }

  const base = REGISTRY.get(skillId);
  if (!base) {
    return side === 'hero' ? BASIC_ATTACK_SKILL : ENEMY_BASIC_ATTACK_SKILL;
  }

  if (side === 'hero') {
    return base;
  }

  if (base.targetPool === 'enemies') {
    return { ...base, targetPool: 'heroes' };
  }

  if (base.targetPool === 'heroes' && base.kind.startsWith('damage')) {
    return base;
  }

  if (base.targetPool === 'heroes') {
    return { ...base, targetPool: flipTargetPool(base.targetPool) };
  }

  return base;
}

export function listCombatSkillsForEnemy(skillIds: readonly string[]): CombatSkillDefinition[] {
  return skillIds.map((id) => resolveCombatSkill(id, 'enemy'));
}
