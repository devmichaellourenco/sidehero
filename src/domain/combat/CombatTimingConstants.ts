/** Segundos de combate simulados por tick do jogo. */
export const COMBAT_DELTA_SECONDS = 1;

/** Máximo de ações resolvidas por tick (evita loop infinito). */
export const MAX_ACTIONS_PER_TICK = 24;

/** Conversão de saves/skills legados (cooldown em turnos). */
export const LEGACY_TURN_SECONDS = 1;

/** Recuperação mínima após usar skill (escala com Cast Speed). */
export const SKILL_ACTION_RECOVERY_SECONDS = 0.35;

/** Intervalo mínimo entre ações (evita burst instantâneo). */
export const MIN_ACTION_INTERVAL_SECONDS = 0.2;
