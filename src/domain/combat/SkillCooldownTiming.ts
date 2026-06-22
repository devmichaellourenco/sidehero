import { CombatSkillDefinition } from '../progression/combat/CombatSkillDefinition';
import { LEGACY_TURN_SECONDS } from './CombatTimingConstants';

export function getInitialCooldownSeconds(skill: CombatSkillDefinition): number {
  if (skill.initialCooldownSeconds !== undefined) return skill.initialCooldownSeconds;
  return skill.initialCooldown * LEGACY_TURN_SECONDS;
}

export function getCooldownSeconds(skill: CombatSkillDefinition): number {
  if (skill.cooldownSeconds !== undefined) return skill.cooldownSeconds;
  return skill.cooldownTurns * LEGACY_TURN_SECONDS;
}

export function formatCooldownLabel(seconds: number): string {
  if (seconds <= 0) return 'Pronto';
  if (seconds < 1) return `${(seconds * 10) / 10}s`;
  return `${Math.ceil(seconds * 10) / 10}s`;
}

/** Contagem regressiva nas skills — exibe décimos abaixo de 10 s. */
export function formatSkillCooldownCountdown(seconds: number): string {
  if (seconds <= 0) return '0';
  if (seconds < 10) {
    const rounded = Math.ceil(seconds * 10) / 10;
    return rounded % 1 === 0 ? String(rounded.toFixed(0)) : rounded.toFixed(1);
  }
  return String(Math.ceil(seconds));
}
