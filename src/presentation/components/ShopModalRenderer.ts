import { GameStateDto } from '../../application/dto/GameStateDto';
import { ShopOfferDto } from '../../application/dto/ShopOfferDto';
import { ASSETS, getAssetUrl, getGearFrameSprite, getGearSprite, imgTag } from '../assets/AssetCatalog';
import {
  renderGearBonusLines,
  GEAR_RARITY_LABELS,
  GEAR_SLOT_LABELS,
  GearSlotKey,
} from './GearPresentation';
import { gearRaritySurfaceClass } from './GearRarityPresentation';
import { getShopMaxRarityForTier, SHOP_OFFER_COUNT } from '../../domain/shop/ShopCatalog';

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderShopOfferTooltip(offer: ShopOfferDto): string {
  const { gear } = offer;
  const rarityLabel = GEAR_RARITY_LABELS[gear.rarity] ?? gear.rarity;
  const slotLabel = GEAR_SLOT_LABELS[gear.slot as GearSlotKey] ?? gear.slot;

  return `
    <span class="shop-offer-tooltip" role="tooltip">
      <span class="shop-offer-tooltip-meta">${escapeHtml(rarityLabel)} · ${escapeHtml(slotLabel)}</span>
      ${renderGearBonusLines(gear)}
    </span>
  `;
}

function renderShopOfferTile(offer: ShopOfferDto): string {
  const { gear } = offer;
  const frameUrl = getGearFrameSprite(gear.rarity);
  const disabledAttr = offer.canAfford ? '' : 'disabled';
  const affordClass = offer.canAfford ? '' : ' shop-offer-unaffordable';
  const goldIcon = imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'shop-gold-icon');

  return `
    <article class="shop-offer-tile ${gearRaritySurfaceClass(gear.rarity)}${affordClass}" data-shop-offer="${offer.id}">
      <strong class="shop-offer-name">${escapeHtml(gear.name)}</strong>
      <div class="shop-offer-icon-wrap" style="--gear-frame: url('${frameUrl}')">
        ${imgTag(getGearSprite(gear), gear.name, 'shop-offer-icon')}
      </div>
      <div class="shop-offer-actions">
        <button
          type="button"
          class="gear-equip-btn shop-buy-btn"
          data-shop-buy="${offer.id}"
          aria-label="Comprar por ${offer.price} ouro"
          ${disabledAttr}
        >
          ${goldIcon} ${offer.price}
        </button>
      </div>
      ${renderShopOfferTooltip(offer)}
    </article>
  `;
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
    const maxRarity = getShopMaxRarityForTier(state.difficultyTier);
    const maxRarityLabel = GEAR_RARITY_LABELS[maxRarity] ?? maxRarity;

    const offerCards = viewModel.offers.map((offer) => renderShopOfferTile(offer)).join('');

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
        <p class="shop-refresh-locked">Renovar estoque: desbloqueie em <strong>Runas</strong></p>
      `;

    container.innerHTML = `
      <p class="shop-intro">
        ${SHOP_OFFER_COUNT} ofertas do tier ${state.difficultyTier}
        (até ${maxRarityLabel}). Estoque muda ao avançar de fase ou renovar.
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
