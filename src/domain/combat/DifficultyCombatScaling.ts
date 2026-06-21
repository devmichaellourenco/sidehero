/** Bônus flat de resistência inata em inimigos conforme o tier global da fase. */
export function tierInnateResistBonus(difficultyTier: number): number {
  if (difficultyTier <= 10) {
    return 0;
  }

  return Math.min(12, Math.floor((difficultyTier - 10) / 15));
}

/** Mantém DOT relevante em fases de tier alto. */
export function scaledDotDamage(baseDamage: number, difficultyTier: number): number {
  const scale = 1 + Math.min(1.5, Math.max(0, difficultyTier - 1) * 0.012);
  return Math.max(1, Math.floor(baseDamage * scale));
}

/** Escala stats primários de loot gerado para tiers mais altos. */
export function lootPrimaryStatScale(difficultyTier: number): number {
  return 1 + Math.min(0.35, Math.max(0, difficultyTier - 1) * 0.003);
}
