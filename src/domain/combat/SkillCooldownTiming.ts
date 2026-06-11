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
