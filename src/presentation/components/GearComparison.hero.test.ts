import { describe, expect, it } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { getGearUpgradeInfoForHero } from './GearComparison';

describe('getGearUpgradeInfoForHero', () => {
  it('calcula upgrade relativo ao herói selecionado', () => {
    const state = {
      heroes: [
        {
          id: 'h1',
          name: 'Galneon',
          equipment: {
            weapon: {
              id: 'w1',
              name: 'Espada velha',
              slot: 'weapon',
              rarity: 'common',
              attackBonus: 5,
              defenseBonus: 0,
              healthBonus: 0,
            },
            armor: null,
            accessory: null,
          },
        },
      ],
      gearUpgradeHints: {},
      inventory: [],
    } as unknown as GameStateDto;

    const info = getGearUpgradeInfoForHero(
      state,
      {
        id: 'g1',
        name: 'Espada nova',
        slot: 'weapon',
        rarity: 'rare',
        attackBonus: 12,
        defenseBonus: 0,
        healthBonus: 0,
        attackSpeedBonus: 0,
        castSpeedBonus: 0,
        critChanceBonus: 0,
        critDamageBonus: 0,
        requirements: { minLevel: 1 },
      },
      'h1',
    );

    expect(info.status).toBe('upgrade');
    expect(info.gain).toBe(7);
    expect(info.recommendation?.heroName).toBe('Galneon');
  });
});
