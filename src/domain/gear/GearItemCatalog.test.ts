import { describe, expect, it } from 'vitest';
import {
  createGearFromCatalogItem,
  getGearCatalogItem,
  listLootCatalogItems,
  resolveCatalogItemId,
  stripGearRaritySuffix,
} from './GearItemCatalog';

describe('GearItemCatalog', () => {
  it('cada entrada tem spriteId único e sprite próprio no catálogo', () => {
    const worn = getGearCatalogItem('worn_sword')!;
    const recruit = getGearCatalogItem('recruit_blade')!;

    expect(worn.spriteId).toBe('worn_sword');
    expect(recruit.spriteId).toBe('recruit_blade');
    expect(worn.spriteId).not.toBe(recruit.spriteId);
    expect(worn.sprite).toBeDefined();
    expect(recruit.sprite).toBeDefined();
    expect(worn.attackBonus).toBe(9);
    expect(recruit.attackBonus).toBe(14);
  });

  it('createGearFromCatalogItem usa spriteId como templateId', () => {
    const gear = createGearFromCatalogItem('igneous_sword', 'test-fire');

    expect(gear.id).toBe('test-fire');
    expect(gear.catalogItemId).toBe('igneous_sword');
    expect(gear.templateId).toBe('igneous_sword');
    expect(gear.rarity).toBe('rare');
    expect(gear.fireDamageBonus).toBe(6);
  });

  it('resolveCatalogItemId por nome e slot', () => {
    expect(resolveCatalogItemId('Machado do Carrasco (epic)', 'weapon')).toBe('headsman_axe');
    expect(resolveCatalogItemId('Anel de Cobre', 'accessory')).toBe('copper_ring');
  });

  it('lista loot por slot, raridade e faixa de nível do mapa', () => {
    const estrenda = listLootCatalogItems('weapon', 'common', 8);

    expect(estrenda.length).toBeGreaterThan(0);
    expect(estrenda.every((item) => (item.requirements?.minLevel ?? 1) <= 12)).toBe(true);
  });

  it('remove sufixo de raridade do nome', () => {
    expect(stripGearRaritySuffix('Espada do Patrulheiro (rare)')).toBe('Espada do Patrulheiro');
  });
});
