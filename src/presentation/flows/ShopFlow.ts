import { GameStateDto } from '../../application/dto/GameStateDto';
import { IGameClient } from '../../application/ports/IGameClient';
import { ShopOfferDto } from '../../application/dto/ShopOfferDto';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { ToastController } from '../components/ToastController';

export interface ShopFlowState {
  offers: ShopOfferDto[];
  refreshCost: number;
  canAffordRefresh: boolean;
  shopRefreshUnlocked: boolean;
  shopRefreshRemaining: number;
  upgradeNodes: UpgradeNodeDto[];
}

export class ShopFlow {
  readonly state: ShopFlowState = {
    offers: [],
    refreshCost: 0,
    canAffordRefresh: false,
    shopRefreshUnlocked: false,
    shopRefreshRemaining: 0,
    upgradeNodes: [],
  };

  constructor(
    private readonly client: IGameClient,
    private readonly toasts: ToastController,
    private readonly onStateUpdated: (state: GameStateDto) => void,
    private readonly refreshModal: () => void,
    private readonly enforceUpgradeGates: () => void,
  ) {}

  async loadShop(): Promise<GameStateDto | null> {
    const response = await this.client.send({ type: 'GET_SHOP_OFFERS' });
    if (!response.ok) return null;

    this.applyShopPayload(response);
    return response.state;
  }

  async loadUpgrades(): Promise<GameStateDto | null> {
    const response = await this.client.send({ type: 'GET_UPGRADE_TREE' });
    if (!response.ok) return null;

    this.state.upgradeNodes = response.upgradeNodes ?? [];
    return response.state;
  }

  async purchaseUpgrade(upgradeId: string): Promise<void> {
    const response = await this.client.send({ type: 'PURCHASE_UPGRADE', upgradeId });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha na compra', 'info');
      return;
    }

    this.state.upgradeNodes = response.upgradeNodes ?? [];
    this.onStateUpdated(response.state);
    this.enforceUpgradeGates();
    this.toasts.show('Melhoria desbloqueada!', 'loot');
    this.refreshModal();
  }

  async refreshShop(): Promise<void> {
    const response = await this.client.send({ type: 'REFRESH_SHOP' });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha ao renovar loja', 'info');
      return;
    }

    this.applyShopPayload(response);
    this.onStateUpdated(response.state);
    this.toasts.show('Loja renovada', 'info');
    this.refreshModal();
  }

  async buyOffer(offerId: string): Promise<void> {
    const response = await this.client.send({ type: 'BUY_SHOP_OFFER', offerId });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha na compra', 'info');
      return;
    }

    this.state.offers = this.state.offers.map((offer) => ({
      ...offer,
      canAfford: response.state.gold >= offer.price,
    }));
    this.state.canAffordRefresh = response.state.gold >= this.state.refreshCost;
    this.state.shopRefreshRemaining = Math.max(
      0,
      response.state.shopRefreshLimit - response.state.shopRefreshUses,
    );

    this.onStateUpdated(response.state);

    if (response.purchasedGear) {
      this.toasts.show(`Comprou ${response.purchasedGear.name}`, 'loot');
    }

    this.refreshModal();
  }

  private applyShopPayload(response: {
    shopOffers?: ShopOfferDto[];
    shopRefreshCost?: number;
    canAffordShopRefresh?: boolean;
    shopRefreshUnlocked?: boolean;
    shopRefreshRemaining?: number;
  }): void {
    if (response.shopOffers) {
      this.state.offers = response.shopOffers;
    }
    if (typeof response.shopRefreshCost === 'number') {
      this.state.refreshCost = response.shopRefreshCost;
    }
    if (typeof response.canAffordShopRefresh === 'boolean') {
      this.state.canAffordRefresh = response.canAffordShopRefresh;
    }
    if (typeof response.shopRefreshUnlocked === 'boolean') {
      this.state.shopRefreshUnlocked = response.shopRefreshUnlocked;
    }
    if (typeof response.shopRefreshRemaining === 'number') {
      this.state.shopRefreshRemaining = response.shopRefreshRemaining;
    }
  }
}
