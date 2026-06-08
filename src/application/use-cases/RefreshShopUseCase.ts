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

export interface RefreshShopResult {
  state: GameStateDto;
  offers: ShopOfferDto[];
  refreshCost: number;
  canAffordRefresh: boolean;
  shopRefreshRemaining: number;
}

export class RefreshShopUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly shopService: ShopService,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(): Promise<RefreshShopResult> {
    const state = await this.repository.load();

    if (!FeatureAccessPolicy.resolve(state.upgradeLevels).shopRefresh) {
      throw new Error('Renovar loja não desbloqueado');
    }

    const limit = getShopRefreshLimit(state.upgradeLevels);
    if (state.shopRefreshUses >= limit) {
      throw new Error('Limite de renovações deste stage atingido');
    }

    const refreshCost = calculateShopRefreshCost(state.currentDifficultyTier(), state.upgradeLevels);

    if (!state.gold.canAfford(refreshCost)) {
      throw new Error('Ouro insuficiente para renovar a loja');
    }

    const nextState = state
      .withGold(state.gold.spend(refreshCost))
      .withShopRefreshSeed(state.shopRefreshSeed + 1)
      .withShopRefreshUses(state.shopRefreshUses + 1)
      .addLog(`Renovou a loja por ${refreshCost} ouro`);

    await this.repository.save(nextState);

    const offers = this.shopService
      .generateOffers(nextState.currentDifficultyTier(), nextState.shopRefreshSeed)
      .map((offer) => ({
        id: offer.id,
        price: offer.price,
        gear: mapGearToDto(offer.gear),
        canAfford: nextState.gold.canAfford(offer.price),
      }));

    const nextRefreshCost = calculateShopRefreshCost(
      nextState.currentDifficultyTier(),
      nextState.upgradeLevels,
    );

    return {
      state: this.presenter.present(nextState),
      offers,
      refreshCost: nextRefreshCost,
      canAffordRefresh: canRefreshShop(nextState),
      shopRefreshRemaining: Math.max(0, limit - nextState.shopRefreshUses),
    };
  }
}
