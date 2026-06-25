import { describe, expect, it } from 'vitest';
import { resolveGearSpritePath } from './GearSpriteCatalog';

describe('GearSpriteCatalog', () => {
  it('resolve sprite por templateId', () => {
    expect(
      resolveGearSpritePath({
        templateId: 'pixel_axe',
        slot: 'weapon',
      }),
    ).toBe('gear/items/equip_axe_2.png');
  });

  it('resolve sprite da espada padrão por raridade', () => {
    expect(
      resolveGearSpritePath({
        templateId: 'galneon_standard_sword',
        slot: 'weapon',
        rarity: 'epic',
      }),
    ).toBe('gear/items/standard_epic_sword.png');
  });

  it('usa fallback de slot quando templateId ausente', () => {
    expect(resolveGearSpritePath({ slot: 'armor' })).toBe('gear/items/equip_shield_wood.png');
  });
});
