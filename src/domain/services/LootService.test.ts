import { describe, expect, it, vi } from 'vitest';
import { GearSlot } from '../entities/Gear';
import { ACTIVE_GEAR_SLOTS } from '../gear/GearSlotCatalog';
import { GALNEON_STANDARD_SWORD_TEMPLATE_ID } from '../gear/GalneonGearCatalog';
import { LootService } from './LootService';

describe('LootService', () => {
  const lootService = new LootService();

  it('generateDeterministicGearForSlot é reprodutível para mesmos parâmetros', () => {
    const first = lootService.generateDeterministicGearForSlot(5, 'weapon', 'rare', 2);
    const second = lootService.generateDeterministicGearForSlot(5, 'weapon', 'rare', 2);

    expect(second.id).toBe(first.id);
    expect(second.templateId).toBe(first.templateId);
    expect(second.rarity).toBe('rare');
    expect(second.slot).toBe('weapon');
  });

  it('generateDeterministicGearForSlot varia por slot e seed', () => {
    const weapon = lootService.generateDeterministicGearForSlot(5, 'weapon', 'common', 0);
    const armor = lootService.generateDeterministicGearForSlot(5, 'armor', 'common', 0);

    expect(weapon.slot).toBe('weapon');
    expect(armor.slot).toBe('armor');
    expect(weapon.templateId).not.toBe(armor.templateId);
  });

  it('generateGearFromTemplate aplica slot e raridade do template', () => {
    const gear = lootService.generateGearFromTemplate(
      GALNEON_STANDARD_SWORD_TEMPLATE_ID,
      8,
      'epic',
      'loot-test-sword',
    );

    expect(gear.id).toBe('loot-test-sword');
    expect(gear.slot).toBe('weapon');
    expect(gear.rarity).toBe('epic');
    expect(gear.templateId).toBe(GALNEON_STANDARD_SWORD_TEMPLATE_ID);
    expect(gear.attackBonus).toBeGreaterThan(0);
  });

  it('generateGearFromTemplate lança para template inválido', () => {
    expect(() => lootService.generateGearFromTemplate('template_inexistente', 1, 'common')).toThrow(
      'Template de equipamento inválido',
    );
  });

  it('generateGearForSlot usa slot solicitado e escala stats por raridade', () => {
    const common = lootService.generateGearForSlot(10, 'armor', 'common');
    const epic = lootService.generateGearForSlot(10, 'armor', 'epic');

    expect(common.slot).toBe('armor');
    expect(epic.slot).toBe('armor');
    expect(epic.defenseBonus).toBeGreaterThan(common.defenseBonus);
  });

  it('generateGearForChest retorna item de slot ativo válido', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const gear = lootService.generateGearForChest('boss', 12);

    expect(ACTIVE_GEAR_SLOTS).toContain(gear.slot);
    expect(gear.rarity).toBeDefined();

    vi.restoreAllMocks();
  });

  it('raridades mais altas produzem bônus primários maiores no mesmo slot', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const slots: GearSlot[] = ['weapon', 'armor', 'accessory'];
    for (const slot of slots) {
      const rare = lootService.generateGearForSlot(6, slot, 'rare');
      const legendary = lootService.generateGearForSlot(6, slot, 'legendary');
      const rarePrimary =
        slot === 'weapon'
          ? rare.attackBonus
          : slot === 'armor'
            ? rare.defenseBonus
            : rare.healthBonus;
      const legendaryPrimary =
        slot === 'weapon'
          ? legendary.attackBonus
          : slot === 'armor'
            ? legendary.defenseBonus
            : legendary.healthBonus;

      expect(legendaryPrimary).toBeGreaterThan(rarePrimary);
    }

    vi.restoreAllMocks();
  });

  it('generateGearFromTemplate com tema elemental aplica bônus temático', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const gear = lootService.generateGearFromTemplate('flame_brand', 10, 'rare', 'themed-fire');

    expect(gear.templateId).toBe('flame_brand');
    expect(gear.fireDamageBonus).toBeGreaterThan(0);

    vi.restoreAllMocks();
  });

  it('template de armadura temática aplica resistência', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const gear = lootService.generateGearFromTemplate('glacial_mail', 10, 'epic', 'themed-cold');

    expect(gear.coldResistBonus).toBeGreaterThan(0);

    vi.restoreAllMocks();
  });

  it('template de acessório temático aplica dano e resistência', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const gear = lootService.generateGearFromTemplate('ruby_signet', 12, 'legendary', 'themed-ring');

    expect(gear.fireDamageBonus).toBeGreaterThan(0);
    expect(gear.fireResistBonus).toBeGreaterThan(0);

    vi.restoreAllMocks();
  });
});
