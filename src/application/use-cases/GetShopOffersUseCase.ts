import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { ShopService } from '../../domain/services/ShopService';
import { ShopOfferDto } from '../dto/ShopOfferDto';
import { mapGameStateToDto, mapGearToDto, GameStateDto } from '../dto/GameStateDto';

export interface GetShopOffersResult {
  state: GameStateDto;
  offers: ShopOfferDto[];
  refreshCost: number;
  canAffordRefresh: boolean;
}

export class GetShopOffersUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly shopService: ShopService,
  ) {}

  async execute(): Promise<GetShopOffersResult> {
    const state = await this.repository.load();
    const offers = this.shopService
      .generateOffers(state.stage, state.shopRefreshSeed)
      .map((offer) => ({
        id: offer.id,
        price: offer.price,
        gear: mapGearToDto(offer.gear),
        canAfford: state.gold.canAfford(offer.price),
      }));

    const refreshCost = this.shopService.calculateRefreshCost(state.stage);

    return {
      state: mapGameStateToDto(state),
      offers,
      refreshCost,
      canAffordRefresh: state.gold.canAfford(refreshCost),
    };
  }
}
