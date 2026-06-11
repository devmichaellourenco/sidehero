import { Enemy } from '../entities/Enemy';
import { Gear } from '../entities/Gear';
import { Hero } from '../entities/Hero';
import { getClassCombatBaseline } from './ClassCombatBaselines';
import { CombatProfile, createCombatProfile } from './CombatProfile';
import { getEnemyCombatBaseline } from './EnemyCombatBaselines';

function sumGearBonus(gear: Partial<Record<string, Gear | null>>, selector: (g: Gear) => number): number {
  return Object.values(gear ?? {}).reduce((sum, item) => {
    if (!item) return sum;
    return sum + selector(item);
  }, 0);
}

export class CombatProfileProvider {
  forHero(hero: Hero): CombatProfile {
    const baseline = getClassCombatBaseline(hero.heroClass);
    const equipment = hero.toProps().equipment;
    const dexBonus = hero.totalAttributes.dex * 0.002;

    return createCombatProfile({
      attackSpeed: baseline.attackSpeed + sumGearBonus(equipment, (g) => g.attackSpeedBonus) + dexBonus,
      castSpeed: baseline.castSpeed + sumGearBonus(equipment, (g) => g.castSpeedBonus),
      critChance: Math.min(0.75, baseline.critChance + sumGearBonus(equipment, (g) => g.critChanceBonus)),
      critDamage: baseline.critDamage + sumGearBonus(equipment, (g) => g.critDamageBonus),
    });
  }

  forEnemy(enemy: Enemy, isBoss = false): CombatProfile {
    const baseline = getEnemyCombatBaseline(enemy.enemyType, isBoss);
    const stageAspdBonus = Math.min(0.3, enemy.stage * 0.002);

    return createCombatProfile({
      attackSpeed: baseline.attackSpeed + stageAspdBonus,
      castSpeed: baseline.castSpeed,
      critChance: baseline.critChance,
      critDamage: baseline.critDamage,
    });
  }
}
