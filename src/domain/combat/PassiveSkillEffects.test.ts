import { describe, expect, it } from 'vitest';
import { Hero } from '../entities/Hero';
import {
  evasionDodgeBonusAtRank,
  isPassiveSkillActive,
  passiveVitalityHealthBonus,
  vitalityHealthBonusAtRank,
} from './PassiveSkillEffects';

function heroWithSkills(equippedSkillIds: string[], skillRanks: Record<string, number> = {}): Hero {
  const base = Hero.createStarter('hero-1', 'knight', 'Test');
  return Hero.restore({
    ...base.toProps(),
    skillRanks: { basic_attack: 1, ...skillRanks },
    equippedSkillIds,
  });
}

describe('PassiveSkillEffects', () => {
  it('esquiva concede 2,5% por level', () => {
    expect(evasionDodgeBonusAtRank(1)).toBeCloseTo(0.025);
    expect(evasionDodgeBonusAtRank(3)).toBeCloseTo(0.075);
  });

  it('vitalidade concede STR×2 HP por level quando equipada', () => {
    const hero = heroWithSkills(['vitality', 'basic_attack'], { vitality: 2 });
    const str = hero.totalAttributes.str;

    expect(isPassiveSkillActive(hero, 'vitality')).toBe(true);
    expect(passiveVitalityHealthBonus(hero)).toBe(vitalityHealthBonusAtRank(2, str));
    expect(passiveVitalityHealthBonus(hero)).toBe(str * 4);
  });

  it('passiva inativa sem equipar no slot', () => {
    const hero = heroWithSkills(['basic_attack'], { vitality: 2, evasion: 1 });
    expect(isPassiveSkillActive(hero, 'vitality')).toBe(false);
    expect(passiveVitalityHealthBonus(hero)).toBe(0);
  });
});
