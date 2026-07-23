import { CombatSkillDefinition } from '../progression/combat/CombatSkillDefinition';
import { isDamageCombatKind } from '../progression/combat/SkillCombatKind';
import { isPhysicalDamageSkill } from '../progression/combat/SkillDamageBalance';

/** Compensa o buff de DPS das skills dos heróis (~+20% efetivo). */
export const ENEMY_HP_BALANCE_FACTOR = 1.22;

/** Leve aumento no ATK base para pressão ofensiva proporcional. */
export const ENEMY_ATK_BALANCE_FACTOR = 1.08;

/** Multiplicador de dano em skills ofensivas de inimigos. */
export const ENEMY_DAMAGE_SKILL_MULTIPLIER = 1.12;

/** Skills físicas de inimigos não ficam abaixo desta fração do ATK do monstro. */
export const ENEMY_PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO = 1.15;

/** Fração da ASPD de tier no estágio inicial; o restante vem do tier da fase. */
export const ENEMY_BASE_ATTACK_SPEED_FACTOR = 0.88;

/** Bônus de ASPD por tier de dificuldade (stage do inimigo). */
export const ENEMY_STAGE_ATTACK_SPEED_SCALE = 0.0015;

export const ENEMY_MAX_STAGE_ATTACK_SPEED_BONUS = 0.18;

/**
 * Playtest: inimigos nascem com HP fixo para avançar fases rápido.
 * Desligar (`false`) antes de release ou balanceamento sério.
 */
export const ENEMY_QUICK_PHASE_TEST_HP = false;

export const ENEMY_QUICK_PHASE_TEST_MAX_HEALTH = 1;

export function resolveEnemySpawnMaxHealth(calculatedMaxHealth: number): number {
  if (ENEMY_QUICK_PHASE_TEST_HP) {
    return ENEMY_QUICK_PHASE_TEST_MAX_HEALTH;
  }

  return Math.max(1, calculatedMaxHealth);
}

export function resolveEnemyStageAttackSpeedBonus(stage: number): number {
  return Math.min(ENEMY_MAX_STAGE_ATTACK_SPEED_BONUS, Math.max(0, stage) * ENEMY_STAGE_ATTACK_SPEED_SCALE);
}

export function resolveEnemyAttackSpeed(classBaselineAspd: number, stage: number): number {
  return classBaselineAspd * ENEMY_BASE_ATTACK_SPEED_FACTOR + resolveEnemyStageAttackSpeedBonus(stage);
}

export function applyEnemyDamageSkillPower(
  skill: CombatSkillDefinition,
  rawPower: number,
  enemyAttack: number,
): number {
  if (!isDamageCombatKind(skill.kind) || skill.usesAttackStat) {
    return Math.max(1, Math.floor(rawPower));
  }

  let power = Math.max(1, Math.floor(rawPower * ENEMY_DAMAGE_SKILL_MULTIPLIER));

  if (isPhysicalDamageSkill(skill)) {
    const physicalFloor = Math.floor(enemyAttack * ENEMY_PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO);
    power = Math.max(power, physicalFloor);
  }

  return power;
}
