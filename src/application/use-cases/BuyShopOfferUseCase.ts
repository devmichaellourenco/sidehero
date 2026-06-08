import { Gear } from '../../domain/entities/Gear';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { ShopService } from '../../domain/services/ShopService';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { mapPersistedGameState } from '../mappers/GameStateDtoMapper';
import { mapGearToDto, GameStateDto, GearDto } from '../dto/GameStateDto';

export interface BuyShopOfferResult {
  state: GameStateDto;
  purchasedGear: GearDto;
}

export class BuyShopOfferUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly shopService: ShopService,
    private readonly upgradeService: UpgradeService,
  ) {}

  async execute(offerId: string): Promise<BuyShopOfferResult> {
    const state = await this.repository.load();
    const offer = this.shopService.findOffer(state.stage, state.shopRefreshSeed, offerId);

    if (!offer) {
      throw new Error('Oferta não encontrada');
    }

    if (!state.gold.canAfford(offer.price)) {
      throw new Error('Ouro insuficiente');
    }

    const purchasedGear = Gear.create({
      ...offer.gear.toProps(),
      id: `gear-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    });
    const nextState = state
      .withGold(state.gold.spend(offer.price))
      .withInventory([...state.inventory, purchasedGear])
      .addLog(`Comprou ${purchasedGear.name} por ${offer.price} ouro`);

    await this.repository.save(nextState);

    return {
      state: mapPersistedGameState(nextState, this.upgradeService),
      purchasedGear: mapGearToDto(purchasedGear),
    };
  }
}
