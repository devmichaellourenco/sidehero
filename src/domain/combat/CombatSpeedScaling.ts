import { Hero } from '../entities/Hero';
import { HeroClass } from '../entities/HeroClass';

/** Fração da ASPD de classe no nível 1; o restante vem de atributos. */
export const BASE_ATTACK_SPEED_FACTOR = 0.58;

/** ASPD adicional por ponto de DEX. */
export const DEX_ATTACK_SPEED_SCALE = 0.016;

/** ASPD adicional por ponto de STR em classes físicas. */
export const STR_ATTACK_SPEED_SCALE = 0.006;

const PHYSICAL_MELEE_CLASSES: ReadonlySet<HeroClass> = new Set([
  'knight',
  'berserker',
  'paladin',
]);

export function resolveHeroAttributeAttackSpeed(classBaselineAspd: number, hero: Hero): number {
  const { dex, str } = hero.totalAttributes;
  const classAspd = classBaselineAspd * BASE_ATTACK_SPEED_FACTOR;
  const dexBonus = dex * DEX_ATTACK_SPEED_SCALE;
  const strBonus = PHYSICAL_MELEE_CLASSES.has(hero.heroClass)
    ? str * STR_ATTACK_SPEED_SCALE
    : 0;

  return classAspd + dexBonus + strBonus;
}
