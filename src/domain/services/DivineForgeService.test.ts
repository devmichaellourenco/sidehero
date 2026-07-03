import { describe, expect, it, vi } from 'vitest';
import { GameState } from '../entities/GameState';
import { Gear, GearRarity } from '../entities/Gear';
import { FORGE_FUSE_REQUIRED_COUNT } from '../gear/GearRarityProgression';
import { calculateForgeSalvageGold } from '../forge/ForgeSalvageGoldCatalog';
import { DivineForgeService } from './DivineForgeService';
import { ILootService } from './ILootService';

function forgeGear(id: string, rarity: GearRarity): Gear {
  return Gear.create({
    id,
    name: `Item ${id}`,
    templateId: 'equip_axe_1',
    slot: 'weapon',
    rarity,
    attackBonus: 5,
    defenseBonus: 0,
    healthBonus: 0,
  });
}

function stateWithForgeUnlocked(inventory: Gear[] = []): GameState {
  return GameState.initial()
    .withUpgradeLevels({ divine_forge: 1 })
    .withInventory(inventory)
    .withStage(10);
}

function createService(created = forgeGear('fused', 'uncommon')): DivineForgeService {
  const loot: ILootService = {
    generateGear: vi.fn(),
    generateGearForChest: vi.fn(),
    generateDeterministicGearForSlot: vi.fn(),
    generateGearFromTemplate: vi.fn(),
    generateGearForSlot: vi.fn().mockReturnValue(created),
  };

  return new DivineForgeService(loot);
}

describe('DivineForgeService', () => {
  it('fuse exige forja desbloqueada', () => {
    const service = createService();
    const ids = Array.from({ length: FORGE_FUSE_REQUIRED_COUNT }, (_, i) => `g${i}`);

    expect(() => service.fuse(GameState.initial().withInventory(ids.map((id) => forgeGear(id, 'common'))), ids)).toThrow(
      'Forja Divina não desbloqueada',
    );
  });

  it('fuse exige exatamente 9 itens', () => {
    const service = createService();
    const state = stateWithForgeUnlocked([forgeGear('g1', 'common')]);

    expect(() => service.fuse(state, ['g1'])).toThrow(`Selecione exatamente ${FORGE_FUSE_REQUIRED_COUNT} itens`);
  });

  it('fuse exige mesma raridade em todos os itens', () => {
    const service = createService();
    const inventory = [
      ...Array.from({ length: 8 }, (_, i) => forgeGear(`c${i}`, 'common')),
      forgeGear('r0', 'rare'),
    ];
    const ids = inventory.map((gear) => gear.id);
    const state = stateWithForgeUnlocked(inventory);

    expect(() => service.fuse(state, ids)).toThrow('Todos os itens devem ter a mesma raridade');
  });

  it('fuse rejeita raridade máxima', () => {
    const service = createService();
    const inventory = Array.from({ length: FORGE_FUSE_REQUIRED_COUNT }, (_, i) =>
      forgeGear(`m${i}`, 'mythic'),
    );
    const ids = inventory.map((gear) => gear.id);
    const state = stateWithForgeUnlocked(inventory);

    expect(() => service.fuse(state, ids)).toThrow('Raridade máxima — não é possível fundir');
  });

  it('fuse consome 9 itens e adiciona item da raridade superior', () => {
    const created = forgeGear('fused-result', 'uncommon');
    const service = createService(created);
    const inventory = Array.from({ length: FORGE_FUSE_REQUIRED_COUNT }, (_, i) =>
      forgeGear(`c${i}`, 'common'),
    );
    const ids = inventory.map((gear) => gear.id);
    const state = stateWithForgeUnlocked(inventory);

    const result = service.fuse(state, ids);

    expect(result.created).toBe(created);
    expect(result.state.inventory).toHaveLength(1);
    expect(result.state.inventory[0].id).toBe('fused-result');
    expect(result.state.battleLog.at(-1)?.message).toContain('fundidos');
  });

  it('salvage exige forja desbloqueada', () => {
    const service = createService();

    expect(() => service.salvage(GameState.initial().withInventory([forgeGear('g1', 'common')]), 'g1')).toThrow(
      'Forja Divina não desbloqueada',
    );
  });

  it('salvage remove item e concede ouro por raridade', () => {
    const service = createService();
    const item = forgeGear('salvage-1', 'rare');
    const state = stateWithForgeUnlocked([item]);
    const expectedGold = calculateForgeSalvageGold('rare', state.stage);

    const result = service.salvage(state, 'salvage-1');

    expect(result.goldGained).toBe(expectedGold);
    expect(result.state.inventory).toHaveLength(0);
    expect(result.state.gold.amount).toBe(expectedGold);
    expect(result.state.battleLog.at(-1)?.message).toContain('destruído');
  });
});
