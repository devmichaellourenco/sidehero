import { Enemy } from '../../entities/Enemy';
import { EnemyType } from '../../entities/EnemyType';
import { CombatSkillDefinition } from './CombatSkillDefinition';
import { BASIC_ATTACK_SKILL } from './HeroCombatSkillCatalog';

const ENEMY_BASIC_ATTACK: CombatSkillDefinition = {
  ...BASIC_ATTACK_SKILL,
  targetPool: 'heroes',
  targetPriority: 'lowest_hp_percent',
};

const ENEMY_SKILL_SETS: Record<EnemyType, CombatSkillDefinition[]> = {
  slime: [ENEMY_BASIC_ATTACK],
  goblin: [
    ENEMY_BASIC_ATTACK,
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
    ENEMY_BASIC_ATTACK,
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
    ENEMY_BASIC_ATTACK,
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
    ENEMY_BASIC_ATTACK,
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
  return ENEMY_SKILL_SETS[enemy.enemyType] ?? [ENEMY_BASIC_ATTACK];
}
