import { CombatProfile } from '../../combat/CombatProfile';
import { CombatStatusEffectTracker } from './CombatStatusEffectTracker';
import { resolveEffectiveAttack, resolveEffectiveDefense } from './CombatStatResolver';

export interface ResolvedDamage {
  amount: number;
  isCrit: boolean;
}

export interface DamageRollOptions {
  rng?: () => number;
}

export function mitigatePhysicalDamage(
  rawDamage: number,
  armor: number,
  stageLevel: number,
): number {
  if (rawDamage <= 0) return 0;

  const threshold = 14 * stageLevel + 12;
  const reduction =
    (armor * armor) / (armor * armor + threshold * (armor + 0.4 * rawDamage));
  const capped = Math.min(0.75, reduction);

  return Math.max(1, Math.floor(rawDamage * (1 - capped)));
}

export function rollCriticalMultiplier(
  critChance: number,
  critDamage: number,
  options: DamageRollOptions = {},
): { multiplier: number; isCrit: boolean } {
  const rng = options.rng ?? Math.random;
  const roll = rng();

  if (roll < critChance) {
    return { multiplier: critDamage, isCrit: true };
  }

  return { multiplier: 1, isCrit: false };
}

export function resolveOutgoingDamage(
  rawPower: number,
  targetDefense: number,
  stageLevel: number,
  attackerProfile: CombatProfile,
  options: DamageRollOptions = {},
): ResolvedDamage {
  const { multiplier, isCrit } = rollCriticalMultiplier(
    attackerProfile.critChance,
    attackerProfile.critDamage,
    options,
  );
  const powered = Math.max(1, Math.floor(rawPower * multiplier));
  const amount = mitigatePhysicalDamage(powered, targetDefense, stageLevel);

  return { amount, isCrit };
}

export function resolveEffectiveAttackPower(
  baseAttack: number,
  combatantKey: string,
  statusEffects: CombatStatusEffectTracker,
): number {
  return resolveEffectiveAttack(baseAttack, combatantKey, statusEffects);
}

export function resolveEffectiveTargetDefense(
  baseDefense: number,
  combatantKey: string,
  statusEffects: CombatStatusEffectTracker,
): number {
  return resolveEffectiveDefense(baseDefense, combatantKey, statusEffects);
}
