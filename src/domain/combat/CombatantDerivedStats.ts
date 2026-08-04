import {
  HERO_ATTACK_PER_LEVEL,
  HERO_DEFENSE_PER_LEVEL,
  HERO_HEALTH_PER_LEVEL,
} from '../balance/ProgressionPowerScale';
import { Attributes } from '../progression/Attributes';

export interface CombatantDerivedStatInput {
  baseAttack?: number;
  baseDefense?: number;
  baseMaxHealth?: number;
  level: number;
  attributes: Attributes;
  /** Flat de gear (herói); inimigos usam 0. */
  gearAttack?: number;
  gearDefense?: number;
  gearHealth?: number;
  /** % de gear + passivas. */
  attackPercent?: number;
  defensePercent?: number;
  healthPercent?: number;
  /** Bônus flat de passiva de vitalidade (herói). */
  vitalityHealthFlat?: number;
}

/**
 * ATK derivado — mesma regra para herói (com gear) e inimigo (sem gear).
 * levelBonus usa HERO_ATTACK_PER_LEVEL; baseAttack do inimigo já inclui ganhos de level-up no spawn.
 */
export function deriveCombatAttack(input: CombatantDerivedStatInput): number {
  const gearBonus = input.gearAttack ?? 0;
  const levelBonus = (Math.max(1, input.level) - 1) * HERO_ATTACK_PER_LEVEL;
  const attrBonus = Math.floor(input.attributes.str * 0.5 + input.attributes.dex * 0.3);
  const raw = (input.baseAttack ?? 0) + gearBonus + levelBonus + attrBonus;
  const percent = input.attackPercent ?? 0;
  return Math.max(0, Math.floor(raw * (1 + percent / 100)));
}

export function deriveCombatDefense(input: CombatantDerivedStatInput): number {
  const gearBonus = input.gearDefense ?? 0;
  const levelBonus = (Math.max(1, input.level) - 1) * HERO_DEFENSE_PER_LEVEL;
  const attrBonus = Math.floor(input.attributes.dex * 0.5 + input.attributes.str * 0.2);
  const raw = (input.baseDefense ?? 0) + gearBonus + levelBonus + attrBonus;
  const percent = input.defensePercent ?? 0;
  return Math.max(0, Math.floor(raw * (1 + percent / 100)));
}

export function deriveCombatMaxHealth(input: CombatantDerivedStatInput): number {
  const gearBonus = input.gearHealth ?? 0;
  const levelBonus = (Math.max(1, input.level) - 1) * HERO_HEALTH_PER_LEVEL;
  const attrBonus = input.attributes.str * 2;
  const vitalityBonus = input.vitalityHealthFlat ?? 0;
  const raw = (input.baseMaxHealth ?? 0) + gearBonus + levelBonus + attrBonus + vitalityBonus;
  const percent = input.healthPercent ?? 0;
  return Math.max(1, Math.floor(raw * (1 + percent / 100)));
}
