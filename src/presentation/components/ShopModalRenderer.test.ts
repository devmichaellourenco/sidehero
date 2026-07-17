// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest';
import { GameStateDto, GearDto } from '../../application/dto/GameStateDto';
import { ShopModalRenderer } from './ShopModalRenderer';

function gear(overrides: Partial<GearDto> = {}): GearDto {
  return {
    id: 'g1',
    name: 'Espada Longa do Vento Norte',
    templateId: 'equip_axe_1',
    slot: 'weapon',
    rarity: 'uncommon',
    attackBonus: 5,
    defenseBonus: 0,
    healthBonus: 0,
    requirements: { minLevel: 1 },
    ...overrides,
  } as GearDto;
}

describe('ShopModalRenderer', () => {
  it('exibe título completo, preço no botão e raridade/tipo só no tooltip', () => {
    const container = document.createElement('div');
    const renderer = new ShopModalRenderer();

    renderer.render(
      container,
      { difficultyTier: 1, gold: 100 } as GameStateDto,
      {
        offers: [
          {
            id: 'offer-1',
            price: 42,
            canAfford: true,
            gear: gear(),
          },
        ],
        refreshCost: 10,
        canAffordRefresh: true,
        shopRefreshUnlocked: false,
        shopRefreshRemaining: 0,
      },
      { onBuyOffer: vi.fn(), onRefreshShop: vi.fn() },
    );

    const tile = container.querySelector('[data-shop-offer="offer-1"]');
    expect(tile?.querySelector('.shop-offer-name')?.textContent).toBe(
      'Espada Longa do Vento Norte',
    );
    expect(tile?.querySelector('.shop-offer-meta')).toBeNull();
    expect(tile?.querySelector('.shop-offer-stats-compact')).toBeNull();
    expect(tile?.querySelector('.shop-offer-price')).toBeNull();

    const buyBtn = tile?.querySelector('[data-shop-buy="offer-1"]');
    expect(buyBtn?.textContent?.replace(/\s+/g, ' ').trim()).toContain('42');
    expect(buyBtn?.querySelector('.shop-gold-icon')).toBeTruthy();
    expect(buyBtn?.textContent).not.toContain('Comprar');

    const tooltip = tile?.querySelector('.shop-offer-tooltip');
    expect(tooltip?.querySelector('.shop-offer-tooltip-meta')?.textContent).toBe('Incomum · Arma');
    expect(tooltip?.querySelector('.gear-stat-lines')).toBeTruthy();
  });
});
