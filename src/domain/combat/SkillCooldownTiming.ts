import { CombatSkillDefinition } from '../progression/combat/CombatSkillDefinition';
import {
  ENEMY_SKILL_COOLDOWN_TURN_SECONDS,
  HERO_SKILL_COOLDOWN_TURN_SECONDS,
  MIN_SKILL_COOLDOWN_SECONDS,
  SKILL_COOLDOWN_SECONDS_PER_RANK,
} from './CombatTimingConstants';

export interface SkillCooldownTimingOptions {
  /** Level da skill (herói). Level 1 = cooldown base. */
  rank?: number;
  /** Skills de inimigo não usam escala de herói nem redução por level. */
  forEnemy?: boolean;
}

function resolveBaseCooldownSeconds(
  skill: CombatSkillDefinition,
  forEnemy: boolean,
): number {
  if (skill.cooldownSeconds !== undefined) {
    return Math.max(0, skill.cooldownSeconds);
  }

  const turnSeconds = forEnemy
    ? ENEMY_SKILL_COOLDOWN_TURN_SECONDS
    : HERO_SKILL_COOLDOWN_TURN_SECONDS;
  return Math.max(0, skill.cooldownTurns) * turnSeconds;
}

function resolveBaseInitialCooldownSeconds(
  skill: CombatSkillDefinition,
  forEnemy: boolean,
): number {
  if (skill.initialCooldownSeconds !== undefined) {
    return Math.max(0, skill.initialCooldownSeconds);
  }

  const turnSeconds = forEnemy
    ? ENEMY_SKILL_COOLDOWN_TURN_SECONDS
    : HERO_SKILL_COOLDOWN_TURN_SECONDS;
  return Math.max(0, skill.initialCooldown) * turnSeconds;
}

export function getInitialCooldownSeconds(
  skill: CombatSkillDefinition,
  options: SkillCooldownTimingOptions = {},
): number {
  return resolveBaseInitialCooldownSeconds(skill, options.forEnemy === true);
}

export function getCooldownSeconds(
  skill: CombatSkillDefinition,
  options: SkillCooldownTimingOptions = {},
): number {
  const base = resolveBaseCooldownSeconds(skill, options.forEnemy === true);
  if (base <= 0) return 0;
  if (options.forEnemy) return base;

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
