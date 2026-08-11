import { describe, expect, it } from 'vitest';
import { GameState } from '../../domain/entities/GameState';
import { Gear } from '../../domain/entities/Gear';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { LootService } from '../../domain/services/LootService';
import { ShopService } from '../../domain/services/ShopService';
import { INVENTORY_CAPACITY } from '../../domain/storage/StorageCapacityPolicy';
import { Gold } from '../../domain/value-objects/Gold';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { BuyAndEquipShopOfferUseCase } from './BuyAndEquipShopOfferUseCase';

class MemoryRepository implements IGameStateRepository {
  constructor(private state: GameState) {}

  async load(): Promise<GameState> {
    return this.state;
  }

  async save(state: GameState): Promise<void> {
    this.state = state;
  }

  getState(): GameState {
    return this.state;
  }
}

function fillerGear(id: string): Gear {
  return Gear.create({
    id,
    name: `Filler ${id}`,
    slot: 'accessory',
    rarity: 'common',
    attackBonus: 0,
    defenseBonus: 0,
    healthBonus: 1,
    requirements: { minLevel: 1 },
  });
}

describe('BuyAndEquipShopOfferUseCase', () => {
  const shopService = new ShopService(new LootService());
  const presenter = new GameStatePresenter(new UpgradeService());

  it('compra e equipa em slot vazio sem ocupar inventário', async () => {
    const offers = shopService.generateOffers(1, 0);
    const offer = offers.find((entry) => entry.gear.slot === 'weapon') ?? offers[0];
    const initial = GameState.restore({
      ...GameState.initial().toProps(),
      gold: Math.max(offer.price + 50, 500),
      shopRefreshSeed: 0,
    });
    const repository = new MemoryRepository(initial);
    const useCase = new BuyAndEquipShopOfferUseCase(repository, shopService, presenter);

    const result = await useCase.execute(offer.id, 'hero-1');
    const saved = repository.getState();
    const slot = offer.gear.slot;

    expect(result.purchasedGear.slot).toBe(slot);
    expect(saved.heroes[0].toProps().equipment?.[slot]?.name).toBe(offer.gear.name);
    expect(saved.inventory).toHaveLength(0);
    expect(saved.gold.value()).toBe(initial.gold.value() - offer.price);
  });

  it('ao trocar item equipado, guarda o antigo no inventário', async () => {
    const offers = shopService.generateOffers(1, 0);
    const offer = offers.find((entry) => entry.gear.slot === 'weapon') ?? offers[0];
    const equipped = Gear.create({
      id: 'old-weapon',
      name: 'Adaga Velha',
      slot: 'weapon',
      rarity: 'common',
      attackBonus: 1,
      defenseBonus: 0,
      healthBonus: 0,
      requirements: { minLevel: 1 },
    });
    const hero = GameState.initial().heroes[0].equip(equipped);
    const initial = GameState.restore({
      ...GameState.initial().toProps(),
      heroes: [hero, ...GameState.initial().heroes.slice(1)],
      gold: Math.max(offer.price + 50, 500),
      shopRefreshSeed: 0,
    });
    const repository = new MemoryRepository(initial);
    const useCase = new BuyAndEquipShopOfferUseCase(repository, shopService, presenter);

    await useCase.execute(offer.id, 'hero-1');
    const saved = repository.getState();

    expect(saved.heroes[0].toProps().equipment?.weapon?.name).toBe(offer.gear.name);
    expect(saved.inventory.some((entry) => entry.id === 'old-weapon')).toBe(true);
  });

  it('falha com mensagem clara quando não há espaço para o item substituído', async () => {
    const offers = shopService.generateOffers(1, 0);
    const offer = offers.find((entry) => entry.gear.slot === 'weapon') ?? offers[0];
    const equipped = Gear.create({
      id: 'old-weapon',
      name: 'Adaga Velha',
      slot: 'weapon',
      rarity: 'common',
      attackBonus: 1,
      defenseBonus: 0,
      healthBonus: 0,
      requirements: { minLevel: 1 },
    });
    const hero = GameState.initial().heroes[0].equip(equipped);
    const fullInventory = Array.from({ length: INVENTORY_CAPACITY }, (_, index) =>
      fillerGear(`fill-${index}`),
    );
    const initial = GameState.restore({
      ...GameState.initial().toProps(),
      heroes: [hero, ...GameState.initial().heroes.slice(1)],
      inventory: fullInventory,
      stash: [],
      upgradeLevels: {},
      gold: Math.max(offer.price + 50, 500),
      shopRefreshSeed: 0,
    });
    const repository = new MemoryRepository(initial);
    const useCase = new BuyAndEquipShopOfferUseCase(repository, shopService, presenter);

    await expect(useCase.execute(offer.id, 'hero-1')).rejects.toThrow(
      /Sem espaço no inventário nem no baú/,
    );
    expect(repository.getState().gold.value()).toBe(initial.gold.value());
    expect(repository.getState().heroes[0].toProps().equipment?.weapon?.id).toBe('old-weapon');
  });

  it('recusa compra sem ouro', async () => {
    const offers = shopService.generateOffers(1, 0);
    const offer = offers[0];
    const initial = GameState.restore({
      ...GameState.initial().toProps(),
      gold: 0,
      shopRefreshSeed: 0,
    });
    const repository = new MemoryRepository(initial);
    const useCase = new BuyAndEquipShopOfferUseCase(repository, shopService, presenter);

    await expect(useCase.execute(offer.id, 'hero-1')).rejects.toThrow('Ouro insuficiente');
    expect(Gold.of(0).value()).toBe(0);
  });
});
