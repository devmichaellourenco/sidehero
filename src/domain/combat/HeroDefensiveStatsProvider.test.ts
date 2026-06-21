import { describe, expect, it } from 'vitest';
import { Gear } from '../entities/Gear';
import { Hero } from '../entities/Hero';
import { defensiveMitigationForHero } from './HeroDefensiveStatsProvider';

function heroWithSkills(equippedSkillIds: string[], skillRanks: Record<string, number> = {}): Hero {
  const base = Hero.createStarter('hero-1', 'knight', 'Test');
  return Hero.restore({
    ...base.toProps(),
    skillRanks: { basic_attack: 1, ...skillRanks },
    equippedSkillIds,
  });
}

describe('HeroDefensiveStatsProvider', () => {
  it('soma dodge de gear e passiva de evasão equipada', () => {
    let hero = heroWithSkills(['evasion', 'basic_attack'], { evasion: 2 });
    hero = hero.equip(
      Gear.create({
        id: 'boots',
        name: 'Botas Ágeis',
        slot: 'armor',
        rarity: 'legendary',
        attackBonus: 0,
        defenseBonus: 2,
        healthBonus: 0,
        dodgeChanceBonus: 0.05,
      }),
    );

    const stats = defensiveMitigationForHero(hero);
    expect(stats.dodgeChance).toBeGreaterThan(0.05);
    expect(stats.blockChance).toBe(0);
  });

  it('iron_skin e mana_shield contribuem quando equipadas', () => {
    const hero = heroWithSkills(['iron_skin', 'mana_shield', 'basic_attack'], {
      iron_skin: 2,
      mana_shield: 1,
    });

    const stats = defensiveMitigationForHero(hero);
    expect(stats.damageReduction).toBeCloseTo(0.08);
    expect(stats.blockChance).toBeCloseTo(0.03);
  });
});
