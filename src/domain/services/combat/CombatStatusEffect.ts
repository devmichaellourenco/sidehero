import { SkillCombatKind } from '../../progression/combat/SkillCombatKind';

export interface CombatStatusEffect {
  skillId: string;
  kind: 'buff_attack' | 'debuff_defense';
  magnitude: number;
  remainingTurns: number;
}

export type StatusEffectMap = Record<string, CombatStatusEffect[]>;

export interface StatusApplication {
  combatantKey: string;
  skillId: string;
  kind: Extract<SkillCombatKind, 'buff_attack' | 'debuff_defense'>;
  magnitude: number;
  durationTurns: number;
  skillName: string;
}

export function statusEffectLabel(effect: CombatStatusEffect): string {
  if (effect.kind === 'buff_attack') {
    return `ATK+${effect.magnitude}`;
  }
  return `DEF-${effect.magnitude}`;
}
