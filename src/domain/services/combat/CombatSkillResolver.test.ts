import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { CombatSkillResolver } from './CombatSkillResolver';

describe('CombatSkillResolver', () => {
  const resolver = new CombatSkillResolver();

  it('usa ataque básico sem skills equipadas', () => {
    const hero = Hero.createStarter('h1', 'sorcerer', 'Lyra');
    const action = resolver.resolve(hero, [hero]);

    expect(action.kind).toBe('basic_attack');
    expect(action.power).toBe(hero.attack);
  });

  it('prioriza cura quando aliado está ferido', () => {
    let priest = Hero.createStarter('p1', 'priest', 'Elara');
    priest = Hero.restore({
      ...priest.toProps(),
      skillRanks: { minor_heal: 1 },
      equippedSkillIds: ['minor_heal'],
    });

    let knight = Hero.createStarter('k1', 'knight', 'Arthos');
    knight = Hero.restore({
      ...knight.toProps(),
      currentHealth: 10,
    });

    const action = resolver.resolve(priest, [priest, knight]);

    expect(action.kind).toBe('heal_ally');
    expect(action.skillId).toBe('minor_heal');
    expect(action.targetHeroId).toBe('k1');
    expect(action.power).toBeGreaterThan(0);
  });

  it('sorcerer com arcane_bolt equipado usa magia', () => {
    let sorcerer = Hero.createStarter('s1', 'sorcerer', 'Lyra');
    sorcerer = Hero.restore({
      ...sorcerer.toProps(),
      skillRanks: { arcane_bolt: 1 },
      equippedSkillIds: ['arcane_bolt'],
    });

    const action = resolver.resolve(sorcerer, [sorcerer]);

    expect(action.kind).toBe('damage_magic');
    expect(action.skillId).toBe('arcane_bolt');
    expect(action.power).toBeGreaterThan(sorcerer.attack * 0.5);
  });
});
