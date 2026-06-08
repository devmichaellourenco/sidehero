import { CombatStatusEffectTracker } from './CombatStatusEffectTracker';

export function mitigateDamage(rawDamage: number, effectiveDefense: number): number {
  return Math.max(1, rawDamage - Math.max(0, effectiveDefense));
}

export function resolveEffectiveDefense(
  baseDefense: number,
  combatantKey: string,
  statusEffects: CombatStatusEffectTracker,
): number {
  return Math.max(0, baseDefense - statusEffects.getDefensePenalty(combatantKey));
}

export function resolveEffectiveAttack(
  baseAttack: number,
  combatantKey: string,
  statusEffects: CombatStatusEffectTracker,
): number {
  return Math.max(1, baseAttack + statusEffects.getAttackBonus(combatantKey));
}
