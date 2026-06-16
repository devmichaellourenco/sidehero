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
    return `ATK+${formatStatusMagnitude(effect.magnitude)}`;
  }
  return `DEF-${formatStatusMagnitude(effect.magnitude)}`;
}

export function statusEffectTooltip(effect: CombatStatusEffect): string {
  const statLabel = statusEffectLabel(effect);
  const turns =
    effect.remainingTurns === 1
      ? '1 turno restante'
      : `${effect.remainingTurns} turnos restantes`;
  return `${statLabel} · ${turns}`;
}

function formatStatusMagnitude(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
