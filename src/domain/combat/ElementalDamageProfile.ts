import { DamageElement } from './DamageElement';

export interface ElementalDamageProfile {
  fire: number;
  cold: number;
  lightning: number;
  chaos: number;
  allElemental: number;
}

export const ZERO_ELEMENTAL_DAMAGE: ElementalDamageProfile = {
  fire: 0,
  cold: 0,
  lightning: 0,
  chaos: 0,
  allElemental: 0,
};

export function getEffectiveElementalDamageBonus(
  profile: ElementalDamageProfile,
  element: DamageElement,
): number {
  if (element === 'physical') {
    return 0;
  }

  return profile[element] + profile.allElemental;
}
