import { FeatureAccessPolicy } from '../../domain/policies/FeatureAccessPolicy';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import {
  calculateShopRefreshCost,
  canRefreshShop,
  getShopRefreshLimit,
} from '../../domain/upgrades/ShopRefreshRules';
import { ShopService } from '../../domain/services/ShopService';
import { ShopOfferDto } from '../dto/ShopOfferDto';
import { mapGearToDto } from '../mappers/GearDtoMapper';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';

export interface GetShopOffersResult {
  state: GameStateDto;
  offers: ShopOfferDto[];
  refreshCost: number;
  canAffordRefresh: boolean;
  shopRefreshUnlocked: boolean;
  shopRefreshRemaining: number;
}

export class GetShopOffersUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly shopService: ShopService,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(): Promise<GetShopOffersResult> {
    const state = await this.repository.load();
    const offers = this.shopService
      .generateOffers(state.currentDifficultyTier(), state.shopRefreshSeed)
      .map((offer) => ({
        id: offer.id,
        price: offer.price,
        gear: mapGearToDto(offer.gear),
        canAfford: state.gold.canAfford(offer.price),
      }));

    const refreshCost = calculateShopRefreshCost(state.currentDifficultyTier(), state.upgradeLevels);
    const limit = getShopRefreshLimit(state.upgradeLevels);
    const shopRefreshUnlocked = FeatureAccessPolicy.resolve(state.upgradeLevels).shopRefresh;

    return {
      state: this.presenter.present(state),
      offers,
      refreshCost,
      canAffordRefresh: canRefreshShop(state),
      shopRefreshUnlocked,
      shopRefreshRemaining: Math.max(0, limit - state.shopRefreshUses),
    };
  }
}
