import { Enemy } from '../entities/Enemy';
import { Gear } from '../entities/Gear';
import { Hero } from '../entities/Hero';
import { resolveAttributeAttackSpeed, resolveHeroAttributeAttackSpeed } from './CombatSpeedScaling';
import { getClassCombatBaseline } from './ClassCombatBaselines';
import { CombatProfile, createCombatProfile } from './CombatProfile';
import { getEnemyTierCombatBaseline } from '../enemies/EnemyProgressionCatalog';

const MIN_COMBAT_SPEED = 0.35;
export const MAX_COOLDOWN_REDUCTION = 0.45;
export const MIN_COOLDOWN_REDUCTION = -0.25;

function sumGearBonus(gear: Partial<Record<string, Gear | null>>, selector: (g: Gear) => number): number {
  return Object.values(gear ?? {}).reduce((sum, item) => {
    if (!item) return sum;
    return sum + selector(item);
  }, 0);
}

export function resolveCastSpeed(baseCastSpeed: number, castSpeedBonus: number): number {
  return Math.max(MIN_COMBAT_SPEED, baseCastSpeed + castSpeedBonus);
}

export function resolveCooldownReduction(cooldownReductionPercent: number): number {
  return Math.min(
    MAX_COOLDOWN_REDUCTION,
    Math.max(MIN_COOLDOWN_REDUCTION, cooldownReductionPercent / 100),
  );
}

export function applyCooldownReduction(baseCooldownSeconds: number, cooldownReduction: number): number {
  if (baseCooldownSeconds <= 0) {
    return 0;
  }

  return Math.max(0, baseCooldownSeconds * (1 - cooldownReduction));
}

function resolveAttackSpeed(baseAttackSpeed: number, attackSpeedBonus: number): number {
  return Math.max(MIN_COMBAT_SPEED, baseAttackSpeed + attackSpeedBonus);
}

export class CombatProfileProvider {
  forHero(hero: Hero): CombatProfile {
    const baseline = getClassCombatBaseline(hero.heroClass);
    const equipment = hero.toProps().equipment;
    const attributeAspd = resolveHeroAttributeAttackSpeed(baseline.attackSpeed, hero);
    const attackSpeedBonus = sumGearBonus(equipment, (g) => g.attackSpeedBonus);
    const castSpeedBonus = sumGearBonus(equipment, (g) => g.castSpeedBonus);
    const cooldownReduction = sumGearBonus(equipment, (g) => g.cooldownReductionBonus);

    return createCombatProfile({
      attackSpeed: resolveAttackSpeed(attributeAspd, attackSpeedBonus),
      castSpeed: resolveCastSpeed(baseline.castSpeed, castSpeedBonus),
      cooldownReduction: resolveCooldownReduction(cooldownReduction),
      critChance: Math.min(0.75, baseline.critChance + sumGearBonus(equipment, (g) => g.critChanceBonus)),
      critDamage: baseline.critDamage + sumGearBonus(equipment, (g) => g.critDamageBonus),
    });
  }

  forEnemy(enemy: Enemy, _isBoss = false): CombatProfile {
    const baseline = getEnemyTierCombatBaseline(enemy.enemyType);
    const attributeAspd = resolveAttributeAttackSpeed(
      baseline.attackSpeed,
      enemy.totalAttributes,
      enemy.physicalMeleeAspd,
    );

    return createCombatProfile({
      attackSpeed: resolveAttackSpeed(attributeAspd, 0),
      castSpeed: baseline.castSpeed,
      cooldownReduction: 0,
      critChance: baseline.critChance,
      critDamage: baseline.critDamage,
    });
  }
}
