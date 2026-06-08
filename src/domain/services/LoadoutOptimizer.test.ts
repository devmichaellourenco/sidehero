import { describe, expect, it } from 'vitest';
import { GameState } from '../entities/GameState';
import { Gear } from '../entities/Gear';
import { Hero } from '../entities/Hero';
import { Experience } from '../value-objects/Experience';
import { LoadoutOptimizer } from './LoadoutOptimizer';

function heroAtLevel(id: string, heroClass: 'knight' | 'sorcerer' | 'priest', name: string, level: number): Hero {
  const base = Hero.createStarter(id, heroClass, name);
  return Hero.restore({
    ...base.toProps(),
    experience: Experience.restore(0, 100, level),
  });
}

function createGear(id: string, attackBonus: number, minLevel = 1): Gear {
  return Gear.create({
    id,
    name: `Gear ${id}`,
    slot: 'weapon',
    rarity: 'common',
    attackBonus,
    defenseBonus: 0,
    healthBonus: 0,
    requirements: { minLevel },
  });
}

describe('LoadoutOptimizer.previewUpgradeForGear', () => {
  it('ignora heróis que não atendem requisitos do item', () => {
    const hero = heroAtLevel('hero-1', 'knight', 'Arthos', 1);
    const gear = createGear('g1', 20, 5);
    const state = GameState.restore({
      ...GameState.initial().toProps(),
      heroes: [hero],
      inventory: [gear],
    });
    const optimizer = new LoadoutOptimizer();

    expect(optimizer.previewUpgradeForGear(state, gear)).toBeNull();
  });

  it('retorna melhor ganho entre heróis elegíveis', () => {
    const heroA = heroAtLevel('hero-1', 'knight', 'Arthos', 5);
    const heroB = heroAtLevel('hero-2', 'sorcerer', 'Mage', 5);
    const gear = createGear('g2', 15, 1);
    const state = GameState.restore({
      ...GameState.initial().toProps(),
      heroes: [heroA, heroB],
      inventory: [gear],
    });
    const optimizer = new LoadoutOptimizer();

    const preview = optimizer.previewUpgradeForGear(state, gear);
    expect(preview).not.toBeNull();
    expect(preview?.gain).toBe(15);
    expect(preview?.status).toBe('upgrade');
  });
});
