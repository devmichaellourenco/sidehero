import { CombatSkillDefinition } from './CombatSkillDefinition';
import { isDamageCombatKind } from './SkillCombatKind';

/** Multiplicador global de dano em skills ofensivas do herói (não afeta auto-ataque nem inimigos). */
export const HERO_DAMAGE_SKILL_MULTIPLIER = 1.9;

/** Skills físicas não ficam abaixo desta fração do ATK efetivo do herói. */
export const PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO = 1.35;

export function isPhysicalDamageSkill(skill: CombatSkillDefinition): boolean {
  return (
    isDamageCombatKind(skill.kind) &&
    Boolean(skill.damageComponents?.some((entry) => entry.element === 'physical'))
  );
}

export function applyHeroDamageSkillPower(
  skill: CombatSkillDefinition,
  rawPower: number,
  effectiveAttack: number,
): number {
  if (!isDamageCombatKind(skill.kind) || skill.usesAttackStat) {
    return Math.max(1, Math.floor(rawPower));
  }

  let power = Math.max(1, Math.floor(rawPower * HERO_DAMAGE_SKILL_MULTIPLIER));

  if (isPhysicalDamageSkill(skill)) {
    const physicalFloor = Math.floor(effectiveAttack * PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO);
    power = Math.max(power, physicalFloor);
  }

  return power;
}
