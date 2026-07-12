/** Bônus de ATK/DEF/HP por nível de herói (getters e level-up). */
export const HERO_ATTACK_PER_LEVEL = 4;
export const HERO_DEFENSE_PER_LEVEL = 3;
export const HERO_HEALTH_PER_LEVEL = 15;

export const HERO_LEVEL_UP_ATTACK_GAIN = 3;
export const HERO_LEVEL_UP_DEFENSE_GAIN = 3;
export const HERO_LEVEL_UP_HEALTH_GAIN = 15;

/** Stat primário base de loot rolado pelo nível do item. */
export function gearPrimaryStatBase(itemLevel: number): number {
  const level = Math.max(1, Math.floor(itemLevel));
  return Math.floor(6 + level * 3.5 + level * level * 0.38);
}

/** Escala adicional de loot por nível de item (complementa o tier da fase). */
export function lootPrimaryStatScaleForItemLevel(itemLevel: number): number {
  const level = Math.max(1, Math.floor(itemLevel));
  return 1 + Math.pow(level, 1.28) * 0.016;
}

/** Escala leve de stats de inimigo para acompanhar poder épico do jogador. */
export const ENEMY_CAMPAIGN_STAT_SCALE = 1.12;
