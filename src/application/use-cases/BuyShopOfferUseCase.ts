import { Gear } from '../../domain/entities/Gear';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { ShopService } from '../../domain/services/ShopService';
import { mapGearToDto } from '../mappers/GearDtoMapper';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto, GearDto } from '../dto/GameStateDto';

export interface BuyShopOfferResult {
  state: GameStateDto;
  purchasedGear: GearDto;
}

export class BuyShopOfferUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly shopService: ShopService,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(offerId: string): Promise<BuyShopOfferResult> {
    const state = await this.repository.load();
    const offer = this.shopService.findOffer(
      state.currentDifficultyTier(),
      state.shopRefreshSeed,
      offerId,
    );

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
      state: this.presenter.present(nextState),
      purchasedGear: mapGearToDto(purchasedGear),
    };
  }
}
