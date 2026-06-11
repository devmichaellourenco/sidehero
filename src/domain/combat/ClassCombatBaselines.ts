import { HeroClass } from '../entities/HeroClass';
import { CombatProfile, createCombatProfile } from './CombatProfile';

/** Valores base inspirados no TBH (nível 1, sem gear). */
const BASELINES: Record<HeroClass, CombatProfile> = {
  knight: createCombatProfile({ attackSpeed: 0.9, castSpeed: 1, critChance: 0.025, critDamage: 1.4 }),
  sorcerer: createCombatProfile({ attackSpeed: 0.55, castSpeed: 1, critChance: 0.05, critDamage: 1.65 }),
  priest: createCombatProfile({ attackSpeed: 0.9, castSpeed: 1, critChance: 0.02, critDamage: 1.4 }),
  berserker: createCombatProfile({ attackSpeed: 0.7, castSpeed: 1, critChance: 0.025, critDamage: 1.8 }),
  paladin: createCombatProfile({ attackSpeed: 0.75, castSpeed: 1, critChance: 0.02, critDamage: 1.4 }),
};

export function getClassCombatBaseline(heroClass: HeroClass): CombatProfile {
  return { ...BASELINES[heroClass] };
}
