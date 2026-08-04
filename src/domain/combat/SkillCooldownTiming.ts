import { CombatSkillDefinition } from '../progression/combat/CombatSkillDefinition';
import {
  HERO_SKILL_COOLDOWN_TURN_SECONDS,
  MIN_SKILL_COOLDOWN_SECONDS,
  SKILL_COOLDOWN_SECONDS_PER_RANK,
} from './CombatTimingConstants';

export interface SkillCooldownTimingOptions {
  /** Level da skill. Level 1 = cooldown base. */
  rank?: number;
  /**
   * @deprecated Inimigos usam a mesma cadência dos heróis (BAL-013).
   * Mantido só para não quebrar call sites; ignorado.
   */
  forEnemy?: boolean;
}

function resolveBaseCooldownSeconds(skill: CombatSkillDefinition): number {
  if (skill.cooldownSeconds !== undefined) {
    return Math.max(0, skill.cooldownSeconds);
  }

  return Math.max(0, skill.cooldownTurns) * HERO_SKILL_COOLDOWN_TURN_SECONDS;
}

function resolveBaseInitialCooldownSeconds(skill: CombatSkillDefinition): number {
  if (skill.initialCooldownSeconds !== undefined) {
    return Math.max(0, skill.initialCooldownSeconds);
  }

  return Math.max(0, skill.initialCooldown) * HERO_SKILL_COOLDOWN_TURN_SECONDS;
}

export function getInitialCooldownSeconds(
  skill: CombatSkillDefinition,
  options: SkillCooldownTimingOptions = {},
): number {
  void options.forEnemy;
  return resolveBaseInitialCooldownSeconds(skill);
}

export function getCooldownSeconds(
  skill: CombatSkillDefinition,
  options: SkillCooldownTimingOptions = {},
): number {
  void options.forEnemy;
  const base = resolveBaseCooldownSeconds(skill);
  if (base <= 0) return 0;

  const rank = Math.max(1, options.rank ?? 1);
  const reduced = base - (rank - 1) * SKILL_COOLDOWN_SECONDS_PER_RANK;
  return Math.max(MIN_SKILL_COOLDOWN_SECONDS, reduced);
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
