import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { getSkillCombatProfile } from './SkillCombatCatalog';
import { SkillPowerCalculator } from './SkillPowerCalculator';

describe('SkillPowerCalculator', () => {
  const calculator = new SkillPowerCalculator();

  it('escala poder com atributo INT da sorcerer', () => {
    const hero = Hero.createStarter('s1', 'sorcerer', 'Lyra');
    const profile = getSkillCombatProfile('fireball')!;

    const rank1 = calculator.calculate(profile, 1, hero);
    const boosted = Hero.restore({
      ...hero.toProps(),
      allocatedAttributes: { str: 0, dex: 0, int: 5 },
    });
    const rank1Boosted = calculator.calculate(profile, 1, boosted);

    expect(rank1Boosted).toBeGreaterThan(rank1);
  });
});
