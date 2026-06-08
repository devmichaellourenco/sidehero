import { Enemy } from '../../entities/Enemy';
import { EnemyType } from '../../entities/EnemyType';
import { CombatSkillDefinition } from './CombatSkillDefinition';
import { ENEMY_BASIC_ATTACK_SKILL } from './BasicAttackSkill';

const ENEMY_SKILL_SETS: Record<EnemyType, CombatSkillDefinition[]> = {
  slime: [ENEMY_BASIC_ATTACK_SKILL],
  goblin: [
    ENEMY_BASIC_ATTACK_SKILL,
    {
      skillId: 'goblin_stab',
      kind: 'damage_physical',
      targetPool: 'heroes',
      targetScope: 'single',
      targetPriority: 'lowest_hp_percent',
      usePriority: 55,
      initialCooldown: 0,
      cooldownTurns: 2,
      basePower: 0,
      powerPerRank: 0,
      attributeFactor: 0,
      usesAttackStat: true,
    },
  ],
  orc: [
    ENEMY_BASIC_ATTACK_SKILL,
    {
      skillId: 'orc_smash',
      kind: 'damage_physical',
      targetPool: 'heroes',
      targetScope: 'single',
      targetPriority: 'lowest_hp_percent',
      usePriority: 70,
      initialCooldown: 1,
      cooldownTurns: 2,
      basePower: 0,
      powerPerRank: 0,
      attributeFactor: 0,
      usesAttackStat: true,
    },
  ],
  wraith: [
    ENEMY_BASIC_ATTACK_SKILL,
    {
      skillId: 'wraith_drain',
      kind: 'damage_magic',
      targetPool: 'heroes',
      targetScope: 'single',
      targetPriority: 'lowest_hp_percent',
      usePriority: 75,
      initialCooldown: 0,
      cooldownTurns: 2,
      basePower: 0,
      powerPerRank: 0,
      attributeFactor: 0,
      usesAttackStat: true,
    },
  ],
  dragon: [
    ENEMY_BASIC_ATTACK_SKILL,
    {
      skillId: 'dragon_breath',
      kind: 'damage_magic',
      targetPool: 'heroes',
      targetScope: 'all',
      targetPriority: 'lowest_hp_percent',
      usePriority: 85,
      initialCooldown: 2,
      cooldownTurns: 3,
      basePower: 0,
      powerPerRank: 0,
      attributeFactor: 0,
      usesAttackStat: true,
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
      basePower: 0,
      powerPerRank: 0,
      attributeFactor: 0,
      usesAttackStat: true,
    },
  ],
};

export function listEnemyCombatSkills(enemy: Enemy): CombatSkillDefinition[] {
  return ENEMY_SKILL_SETS[enemy.enemyType] ?? [ENEMY_BASIC_ATTACK_SKILL];
}
