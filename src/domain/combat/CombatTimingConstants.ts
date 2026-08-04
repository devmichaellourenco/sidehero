/** Segundos de combate simulados por tick do jogo. */
export const COMBAT_DELTA_SECONDS = 1;

/** Máximo de ações resolvidas por tick (evita loop infinito). */
export const MAX_ACTIONS_PER_TICK = 24;

/**
 * Conversão de cooldownTurns → segundos (heróis e inimigos — BAL-013).
 * Skills iniciais (~2 turns) ficam com ~10s no level 1.
 */
export const HERO_SKILL_COOLDOWN_TURN_SECONDS = 5;

/** @deprecated Alias legado — mesma cadência unificada. */
export const LEGACY_TURN_SECONDS = HERO_SKILL_COOLDOWN_TURN_SECONDS;

/** @deprecated Inimigos usam HERO_SKILL_COOLDOWN_TURN_SECONDS. */
export const ENEMY_SKILL_COOLDOWN_TURN_SECONDS = HERO_SKILL_COOLDOWN_TURN_SECONDS;

/** Redução de recarga por level de skill acima do 1. */
export const SKILL_COOLDOWN_SECONDS_PER_RANK = 1.5;

/** Piso de recarga de skill após níveis. */
export const MIN_SKILL_COOLDOWN_SECONDS = 4;

/** Recuperação mínima após usar skill (escala com Cast Speed). */
export const SKILL_ACTION_RECOVERY_SECONDS = 0.35;

/**
 * Fração do ATK aplicada no ataque básico (heróis e inimigos).
 * Básico é mais frequente (TTA individual), então causa menos dano por golpe.
 */
export const BASIC_ATTACK_DAMAGE_RATIO = 0.5;
