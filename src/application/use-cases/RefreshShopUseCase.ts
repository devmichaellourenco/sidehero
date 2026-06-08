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
    private readonly upgradeService: UpgradeService,
  ) {}

  async execute(): Promise<RefreshShopResult> {
    const state = await this.repository.load();

    if (getFeatureLevel(state.upgradeLevels, 'shop_refresh') < 1) {
      throw new Error('Renovar loja não desbloqueado');
    }

    const limit = getShopRefreshLimit(state.upgradeLevels);
    if (state.shopRefreshUses >= limit) {
      throw new Error('Limite de renovações deste stage atingido');
    }

    const refreshCost = calculateShopRefreshCost(state.stage, state.upgradeLevels);

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
      .generateOffers(nextState.stage, nextState.shopRefreshSeed)
      .map((offer) => ({
        id: offer.id,
        price: offer.price,
        gear: mapGearToDto(offer.gear),
        canAfford: nextState.gold.canAfford(offer.price),
      }));

    const nextRefreshCost = calculateShopRefreshCost(nextState.stage, nextState.upgradeLevels);

    return {
      state: mapPersistedGameState(nextState, this.upgradeService),
      offers,
      refreshCost: nextRefreshCost,
      canAffordRefresh: canRefreshShop(nextState),
      shopRefreshRemaining: Math.max(0, limit - nextState.shopRefreshUses),
    };
  }
}
