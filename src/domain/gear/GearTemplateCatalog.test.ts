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

  it('lista quatro templates por slot ativo', () => {
    expect(listGearTemplatesForSlot('weapon')).toHaveLength(4);
    expect(listGearTemplatesForSlot('armor')).toHaveLength(4);
    expect(listGearTemplatesForSlot('accessory')).toHaveLength(4);
  });

  it('não inclui itens exclusivos de herói no loot aleatório', () => {
    const weaponTemplates = listGearTemplatesForSlot('weapon');
    expect(weaponTemplates.some((entry) => entry.id === 'galneon_standard_sword')).toBe(false);
  });
});
