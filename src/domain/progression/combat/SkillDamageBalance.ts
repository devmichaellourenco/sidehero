import { CombatSkillDefinition } from './CombatSkillDefinition';
import { isDamageCombatKind } from './SkillCombatKind';

/** Skills físicas não ficam abaixo desta fração do ATK efetivo do herói. */
export const PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO = 1.35;

export function isPhysicalDamageSkill(skill: CombatSkillDefinition): boolean {
  return (
    isDamageCombatKind(skill.kind) &&
    Boolean(skill.damageComponents?.some((entry) => entry.element === 'physical'))
  );
}

/**
 * Poder da skill (herói): Base × (powerPerRank × nível) × (atributo × fator).
 * Sem multiplicador global — a força relativa fica nos valores do catálogo.
 */
export function applyHeroDamageSkillPower(
  skill: CombatSkillDefinition,
  rawPower: number,
  effectiveAttack: number,
): number {
  if (!isDamageCombatKind(skill.kind) || skill.usesAttackStat) {
    return Math.max(1, Math.floor(rawPower));
  }

  let power = Math.max(1, Math.floor(rawPower));

  if (isPhysicalDamageSkill(skill)) {
    const physicalFloor = Math.floor(effectiveAttack * PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO);
    power = Math.max(power, physicalFloor);
  }

  return power;
}

/** Termo de rank: powerPerRank × nível da skill (nível 1 já conta). */
export function skillRankMultiplier(powerPerRank: number, rank: number): number {
  return Math.max(0, powerPerRank) * Math.max(1, rank);
}

/** Contribuição de atributo na fórmula multiplicativa. */
export function skillAttributeMultiplier(attributeValue: number, attributeFactor: number): number {
  return Math.max(0, attributeValue) * Math.max(0, attributeFactor);
}

/** Poder bruto antes do floor/piso físico. */
export function calculateHeroSkillRawPower(
  skill: CombatSkillDefinition,
  rank: number,
  attributeValue: number,
): number {
  return (
    Math.max(0, skill.basePower) *
    skillRankMultiplier(skill.powerPerRank, rank) *
    skillAttributeMultiplier(attributeValue, skill.attributeFactor)
  );
}
