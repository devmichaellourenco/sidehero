import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { ShopService } from '../../domain/services/ShopService';
import { ShopOfferDto } from '../dto/ShopOfferDto';
import { mapGameStateToDto, mapGearToDto, GameStateDto } from '../dto/GameStateDto';

export interface RefreshShopResult {
  state: GameStateDto;
  offers: ShopOfferDto[];
  refreshCost: number;
  canAffordRefresh: boolean;
}

export class RefreshShopUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly shopService: ShopService,
  ) {}

  async execute(): Promise<RefreshShopResult> {
    const state = await this.repository.load();
    const refreshCost = this.shopService.calculateRefreshCost(state.stage);

    if (!state.gold.canAfford(refreshCost)) {
      throw new Error('Ouro insuficiente para renovar a loja');
    }

    const nextSeed = state.shopRefreshSeed + 1;
    const nextState = state
      .withGold(state.gold.spend(refreshCost))
      .withShopRefreshSeed(nextSeed)
      .addLog(`Renovou a loja por ${refreshCost} ouro`);

    await this.repository.save(nextState);

    const offers = this.shopService.generateOffers(nextState.stage, nextState.shopRefreshSeed).map((offer) => ({
      id: offer.id,
      price: offer.price,
      gear: mapGearToDto(offer.gear),
      canAfford: nextState.gold.canAfford(offer.price),
    }));

    const nextRefreshCost = this.shopService.calculateRefreshCost(nextState.stage);

    return {
      state: mapGameStateToDto(nextState),
      offers,
      refreshCost: nextRefreshCost,
      canAffordRefresh: nextState.gold.canAfford(nextRefreshCost),
    };
  }
}
