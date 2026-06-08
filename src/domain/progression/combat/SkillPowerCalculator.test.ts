import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { getHeroCombatSkill } from './HeroCombatSkillCatalog';
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
});
