import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { getHeroCombatSkill } from './HeroCombatSkillCatalog';
import { listEnemyCombatSkillsByType } from './EnemyCombatSkillCatalog';
import { SkillPowerCalculator } from './SkillPowerCalculator';

describe('SkillPowerCalculator', () => {
  const calculator = new SkillPowerCalculator();

  it('calcula poder de magia com scaling de INT', () => {
    let sorcerer = Hero.createStarter('s1', 'sorcerer', 'Lyra');
    sorcerer = Hero.restore({
      ...sorcerer.toProps(),
      skillRanks: { fireball: 1 },
    });

    const profile = getHeroCombatSkill('fireball')!;
    const power = calculator.calculateForHero(profile, sorcerer);

    expect(power).toBeGreaterThan(profile.basePower);
  });

  it('calcula poder fixo de skills memoráveis de inimigo por stage', () => {
    const calculator = new SkillPowerCalculator();
    const goblin = Enemy.restore({
      ...Enemy.forStage(2).toProps(),
      enemyType: 'goblin',
    });
    const dragon = Enemy.restore({
      ...Enemy.forStage(5).toProps(),
      enemyType: 'dragon',
    });

    const goblinStab = listEnemyCombatSkillsByType('goblin').find(
      (skill) => skill.skillId === 'goblin_stab',
    )!;
    const dragonBreath = listEnemyCombatSkillsByType('dragon').find(
      (skill) => skill.skillId === 'dragon_breath',
    )!;
    const slimeAcid = listEnemyCombatSkillsByType('slime').find(
      (skill) => skill.skillId === 'slime_acid',
    )!;

    expect(calculator.calculateForEnemy(goblinStab, goblin)).toBe(8);
    expect(calculator.calculateForEnemy(dragonBreath, dragon)).toBe(17);
    expect(calculator.calculateForEnemy(slimeAcid, Enemy.forStage(1))).toBe(5);
  });
});
