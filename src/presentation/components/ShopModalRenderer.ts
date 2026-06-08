import { GameStateDto } from '../../application/dto/GameStateDto';
import { ShopOfferDto } from '../../application/dto/ShopOfferDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { renderGearCard } from './GearPresentation';

export type ShopModalHandlers = {
  onBuyOffer: (offerId: string) => void;
};

export class ShopModalRenderer {
  render(
    container: HTMLElement,
    state: GameStateDto,
    offers: ShopOfferDto[],
    handlers: ShopModalHandlers,
  ): void {
    const goldIcon = imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'shop-gold-icon');

    const offerCards = offers
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

    container.innerHTML = `
      <p class="shop-intro">
        Ofertas do Stage ${state.stage}. Itens vão para o inventário — as ofertas mudam ao avançar de stage.
      </p>
      <p class="shop-balance">Seu ouro: ${goldIcon} <strong>${state.gold}</strong></p>
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
  }
}
