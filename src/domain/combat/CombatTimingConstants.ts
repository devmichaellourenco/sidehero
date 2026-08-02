/** Segundos de combate simulados por tick do jogo. */
export const COMBAT_DELTA_SECONDS = 1;

/** Máximo de ações resolvidas por tick (evita loop infinito). */
export const MAX_ACTIONS_PER_TICK = 24;

/** Conversão legado de cooldown em turnos → segundos (inimigos). */
export const LEGACY_TURN_SECONDS = 1;

/**
 * Conversão de cooldownTurns → segundos para skills de herói.
 * Skills iniciais (~2 turns) ficam com ~10s no level 1.
 */
export const HERO_SKILL_COOLDOWN_TURN_SECONDS = 5;

/** Inimigos mantêm cadência legada (1s por turno de cooldown). */
export const ENEMY_SKILL_COOLDOWN_TURN_SECONDS = LEGACY_TURN_SECONDS;

/** Redução de recarga por level de skill acima do 1 (heróis). */
export const SKILL_COOLDOWN_SECONDS_PER_RANK = 1.5;

/** Piso de recarga de skill após níveis (heróis). */
export const MIN_SKILL_COOLDOWN_SECONDS = 4;

/** Recuperação mínima após usar skill (escala com Cast Speed). */
export const SKILL_ACTION_RECOVERY_SECONDS = 0.35;

/**
 * Fração do ATK aplicada no ataque básico.
 * Básico é mais frequente (TTA individual), então causa menos dano por golpe.
 */
export const BASIC_ATTACK_DAMAGE_RATIO = 0.5;
