import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { getFeatureLevel } from '../../domain/upgrades/FeatureKey';
import {
  calculateShopRefreshCost,
  canRefreshShop,
  getShopRefreshLimit,
} from '../../domain/upgrades/ShopRefreshRules';
import { ShopService } from '../../domain/services/ShopService';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { ShopOfferDto } from '../dto/ShopOfferDto';
import { mapPersistedGameState } from '../mappers/GameStateDtoMapper';
import { mapGearToDto, GameStateDto } from '../dto/GameStateDto';

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
    private readonly upgradeService: UpgradeService,
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

    const refreshCost = calculateShopRefreshCost(state.stage, state.upgradeLevels);
    const limit = getShopRefreshLimit(state.upgradeLevels);
    const shopRefreshUnlocked = getFeatureLevel(state.upgradeLevels, 'shop_refresh') >= 1;

    return {
      state: mapPersistedGameState(state, this.upgradeService),
      offers,
      refreshCost,
      canAffordRefresh: canRefreshShop(state),
      shopRefreshUnlocked,
      shopRefreshRemaining: Math.max(0, limit - state.shopRefreshUses),
    };
  }
}
