import { describe, expect, it } from 'vitest';
import {
  listGearTemplatesForSlot,
  resolveGearTemplateId,
  stripGearRaritySuffix,
} from './GearTemplateCatalog';

describe('GearTemplateCatalog', () => {
  it('remove sufixo de raridade do nome', () => {
    expect(stripGearRaritySuffix('Espada Enferrujada (rare)')).toBe('Espada Enferrujada');
  });

  it('resolve template por nome e slot', () => {
    expect(resolveGearTemplateId('Machado Pixel (epic)', 'weapon')).toBe('pixel_axe');
    expect(resolveGearTemplateId('Anel de Cobre (common)', 'accessory')).toBe('copper_ring');
  });

  it('lista oito templates por slot ativo (genéricos + elementais)', () => {
    expect(listGearTemplatesForSlot('weapon')).toHaveLength(8);
    expect(listGearTemplatesForSlot('armor')).toHaveLength(8);
    expect(listGearTemplatesForSlot('accessory')).toHaveLength(8);
  });

  it('inclui templates temáticos elementais em cada slot', () => {
    expect(listGearTemplatesForSlot('weapon').some((entry) => entry.elementTheme === 'fire')).toBe(true);
    expect(listGearTemplatesForSlot('armor').some((entry) => entry.elementTheme === 'cold')).toBe(true);
    expect(listGearTemplatesForSlot('accessory').some((entry) => entry.elementTheme === 'lightning')).toBe(
      true,
    );
  });

  it('não inclui itens exclusivos de herói no loot aleatório', () => {
    const weaponTemplates = listGearTemplatesForSlot('weapon');
    expect(weaponTemplates.some((entry) => entry.id === 'galneon_standard_sword')).toBe(false);
  });
});
