import { GameStateDto } from '../../application/dto/GameStateDto';
import { ShopOfferDto } from '../../application/dto/ShopOfferDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { renderGearCard } from './GearPresentation';

export type ShopModalHandlers = {
  onBuyOffer: (offerId: string) => void;
  onRefreshShop: () => void;
};

export interface ShopModalViewModel {
  offers: ShopOfferDto[];
  refreshCost: number;
  canAffordRefresh: boolean;
  shopRefreshUnlocked: boolean;
  shopRefreshRemaining: number;
}

export class ShopModalRenderer {
  render(
    container: HTMLElement,
    state: GameStateDto,
    viewModel: ShopModalViewModel,
    handlers: ShopModalHandlers,
  ): void {
    const goldIcon = imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'shop-gold-icon');
    const refreshDisabled = viewModel.canAffordRefresh ? '' : 'disabled';

    const offerCards = viewModel.offers
      .map((offer) => {
        const disabledAttr = offer.canAfford ? '' : 'disabled';
        const affordClass = offer.canAfford ? '' : ' shop-offer-unaffordable';

        return `
          <article class="shop-offer-card${affordClass}" data-shop-offer="${offer.id}">
            ${renderGearCard(offer.gear, { showAction: false })}
            <div class="shop-offer-footer">
              <span class="shop-offer-price">${goldIcon} ${offer.price}</span>
              <button
                type="button"
                class="gear-equip-btn shop-buy-btn"
                data-shop-buy="${offer.id}"
                ${disabledAttr}
              >
                Comprar
              </button>
            </div>
          </article>
        `;
      })
      .join('');

    const refreshSection = viewModel.shopRefreshUnlocked
      ? `
        <button
          type="button"
          class="gear-equip-btn shop-refresh-btn"
          data-shop-refresh
          ${refreshDisabled}
        >
          Renovar ${goldIcon} ${viewModel.refreshCost}
          <span class="shop-refresh-remaining">(${viewModel.shopRefreshRemaining} restantes)</span>
        </button>
      `
      : `
        <p class="shop-refresh-locked">Renovar loja: desbloqueie em <strong>Melhorias</strong></p>
      `;

    container.innerHTML = `
      <p class="shop-intro">
        Ofertas do Stage ${state.stage}. Comprar itens é grátis; renovar estoque exige melhoria.
      </p>
      <div class="shop-toolbar">
        <p class="shop-balance">Seu ouro: ${goldIcon} <strong>${state.gold}</strong></p>
        ${refreshSection}
      </div>
      <div class="shop-offers-grid">
        ${offerCards || '<p class="empty-state">Nenhuma oferta disponível.</p>'}
      </div>
    `;

    container.querySelectorAll('[data-shop-buy]').forEach((button) => {
      button.addEventListener('click', () => {
        const offerId = button.getAttribute('data-shop-buy');
        if (offerId && !(button as HTMLButtonElement).disabled) {
          handlers.onBuyOffer(offerId);
        }
      });
    });

    container.querySelector('[data-shop-refresh]')?.addEventListener('click', () => {
      const button = container.querySelector('[data-shop-refresh]') as HTMLButtonElement | null;
      if (button && !button.disabled) {
        handlers.onRefreshShop();
      }
    });
  }
}
