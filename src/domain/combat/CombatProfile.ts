export interface CombatProfile {
  attackSpeed: number;
  castSpeed: number;
  critChance: number;
  critDamage: number;
}

export function createCombatProfile(partial: Partial<CombatProfile> & Pick<CombatProfile, 'attackSpeed'>): CombatProfile {
  return {
    attackSpeed: partial.attackSpeed,
    castSpeed: partial.castSpeed ?? 1,
    critChance: partial.critChance ?? 0,
    critDamage: partial.critDamage ?? 1.4,
  };
}
