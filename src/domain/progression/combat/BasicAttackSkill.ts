import { CombatSkillDefinition } from './CombatSkillDefinition';

export const BASIC_ATTACK_SKILL_ID = 'basic_attack';

export const BASIC_ATTACK_SKILL: CombatSkillDefinition = {
  skillId: BASIC_ATTACK_SKILL_ID,
  kind: 'damage_physical',
  targetPool: 'enemies',
  targetScope: 'single',
  targetPriority: 'lowest_hp_percent',
  usePriority: 0,
  initialCooldown: 0,
  cooldownTurns: 0,
  basePower: 0,
  powerPerRank: 0,
  attributeFactor: 0,
  usesAttackStat: true,
};

export const ENEMY_BASIC_ATTACK_SKILL: CombatSkillDefinition = {
  ...BASIC_ATTACK_SKILL,
  targetPool: 'heroes',
};
