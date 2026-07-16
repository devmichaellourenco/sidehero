import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { getHeroCombatSkill } from './HeroCombatSkillCatalog';
import {
  applyHeroDamageSkillPower,
  calculateHeroSkillRawPower,
  skillRankMultiplier,
} from './SkillDamageBalance';
import { SkillPowerCalculator } from './SkillPowerCalculator';

describe('SkillDamageBalance — fórmula multiplicativa', () => {
  it('rank usa powerPerRank × nível desde o nível 1', () => {
    expect(skillRankMultiplier(10, 1)).toBe(10);
    expect(skillRankMultiplier(10, 2)).toBe(20);
    expect(skillRankMultiplier(5, 3)).toBe(15);
  });

  it('frost_shard = Base × (powerPerRank × rank) × (INT × fator)', () => {
    const skill = getHeroCombatSkill('frost_shard')!;
    const raw = calculateHeroSkillRawPower(skill, 2, 16);
    expect(raw).toBeCloseTo(1 * 5 * 2 * 16 * 0.8, 5);
    expect(applyHeroDamageSkillPower(skill, raw, 20)).toBe(Math.floor(raw));
  });

  it('não aplica multiplicador global 1.9', () => {
    const skill = getHeroCombatSkill('fireball')!;
    const raw = calculateHeroSkillRawPower(skill, 1, 10);
    expect(applyHeroDamageSkillPower(skill, raw, 10)).toBe(Math.max(1, Math.floor(raw)));
  });
});

describe('SkillPowerCalculator — power multiplicativo', () => {
  const calculator = new SkillPowerCalculator();

  it('dobra o termo de rank ao subir de 1 para 2', () => {
    const skill = getHeroCombatSkill('frost_shard')!;
    const base = Hero.createStarter('s1', 'sorcerer', 'Nix');
    const r1 = Hero.restore({
      ...base.toProps(),
      skillRanks: { ...base.toProps().skillRanks, frost_shard: 1 },
    });
    const r2 = Hero.restore({
      ...base.toProps(),
      skillRanks: { ...base.toProps().skillRanks, frost_shard: 2 },
    });

    const p1 = calculator.calculateForHero(skill, r1);
    const p2 = calculator.calculateForHero(skill, r2);
    expect(p2).toBe(p1 * 2);
  });
});
