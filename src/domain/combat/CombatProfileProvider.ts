import { Enemy } from '../entities/Enemy';
import { Gear } from '../entities/Gear';
import { Hero } from '../entities/Hero';
import { resolveHeroAttributeAttackSpeed } from './CombatSpeedScaling';
import { resolveEnemyAttackSpeed } from './EnemyCombatBalance';
import { getClassCombatBaseline } from './ClassCombatBaselines';
import { CombatProfile, createCombatProfile } from './CombatProfile';
import { getEnemyCombatBaseline } from './EnemyCombatBaselines';

const MIN_COMBAT_SPEED = 0.35;
const MAX_COOLDOWN_REDUCTION = 0.45;

function sumGearBonus(gear: Partial<Record<string, Gear | null>>, selector: (g: Gear) => number): number {
  return Object.values(gear ?? {}).reduce((sum, item) => {
    if (!item) return sum;
    return sum + selector(item);
  }, 0);
}

function resolveCastSpeed(baseCastSpeed: number, cooldownReductionPercent: number): number {
  const cdr = Math.min(MAX_COOLDOWN_REDUCTION, Math.max(-0.25, cooldownReductionPercent / 100));
  return Math.max(MIN_COMBAT_SPEED, baseCastSpeed * (1 + cdr));
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
      castSpeed: resolveCastSpeed(baseline.castSpeed + castSpeedBonus, cooldownReduction),
      critChance: Math.min(0.75, baseline.critChance + sumGearBonus(equipment, (g) => g.critChanceBonus)),
      critDamage: baseline.critDamage + sumGearBonus(equipment, (g) => g.critDamageBonus),
    });
  }

  forEnemy(enemy: Enemy, isBoss = false): CombatProfile {
    const baseline = getEnemyCombatBaseline(enemy.enemyType, isBoss);
    const attributeAspd = resolveEnemyAttackSpeed(baseline.attackSpeed, enemy.stage);

    return createCombatProfile({
      attackSpeed: attributeAspd,
      castSpeed: baseline.castSpeed,
      critChance: baseline.critChance,
      critDamage: baseline.critDamage,
    });
  }
}
