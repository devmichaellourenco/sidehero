import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { ShopService } from '../../domain/services/ShopService';
import { ShopOfferDto } from '../dto/ShopOfferDto';
import { mapGameStateToDto, mapGearToDto, GameStateDto } from '../dto/GameStateDto';

export interface GetShopOffersResult {
  state: GameStateDto;
  offers: ShopOfferDto[];
}

export class GetShopOffersUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly shopService: ShopService,
  ) {}

  async execute(): Promise<GetShopOffersResult> {
    const state = await this.repository.load();
    const offers = this.shopService.generateOffers(state.stage).map((offer) => ({
      id: offer.id,
      price: offer.price,
      gear: mapGearToDto(offer.gear),
      canAfford: state.gold.canAfford(offer.price),
    }));

    return {
      state: mapGameStateToDto(state),
      offers,
    };
  }
}
