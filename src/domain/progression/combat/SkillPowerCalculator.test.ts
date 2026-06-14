import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { getHeroCombatSkill } from './HeroCombatSkillCatalog';
import { listEnemyCombatSkillsByType } from './EnemyCombatSkillCatalog';
import { SkillPowerCalculator } from './SkillPowerCalculator';

describe('SkillPowerCalculator', () => {
  const calculator = new SkillPowerCalculator();

  it('calcula poder de magia com scaling de INT', () => {
    let sorcerer = Hero.createStarter('s1', 'sorcerer', 'Nix');
    sorcerer = Hero.restore({
      ...sorcerer.toProps(),
      skillRanks: { fireball: 1 },
    });

    const profile = getHeroCombatSkill('fireball')!;
    const power = calculator.calculateForHero(profile, sorcerer);

    expect(power).toBeGreaterThan(profile.basePower);
  });

  it('calcula poder fixo de skills de inimigo por stage', () => {
    const goblin = Enemy.restore({
      ...Enemy.forStage(2).toProps(),
      enemyType: 'goblin_raider',
    });
    const dragon = Enemy.restore({
      ...Enemy.forStage(5).toProps(),
      enemyType: 'young_green_dragon',
    });

    const goblinStab = listEnemyCombatSkillsByType('goblin_raider').find(
      (skill) => skill.skillId === 'goblin_stab',
    )!;
    const dragonBreath = listEnemyCombatSkillsByType('young_green_dragon').find(
      (skill) => skill.skillId === 'dragon_breath',
    )!;
    const wildBite = listEnemyCombatSkillsByType('giant_rat').find(
      (skill) => skill.skillId === 'wild_bite',
    )!;

    expect(calculator.calculateForEnemy(goblinStab, goblin)).toBe(8);
    expect(calculator.calculateForEnemy(dragonBreath, dragon)).toBe(17);
    expect(calculator.calculateForEnemy(wildBite, Enemy.forStage(1))).toBe(6);
  });
});
