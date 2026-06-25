import { describe, expect, it } from 'vitest';
import { resolveGearSpritePath } from './GearSpriteCatalog';

describe('GearSpriteCatalog', () => {
  it('resolve sprite por templateId', () => {
    expect(resolveGearSpritePath({ templateId: 'pixel_axe', slot: 'weapon' })).toBe(
      'gear/items/equip_axe_2.png',
    );
  });

  it('usa fallback de slot quando templateId ausente', () => {
    expect(resolveGearSpritePath({ slot: 'armor' })).toBe('gear/items/equip_shield_wood.png');
  });
});
