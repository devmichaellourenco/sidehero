import { describe, expect, it } from 'vitest';
import { LootService } from './LootService';
import { parseShopOfferCatalogKey, ShopService } from './ShopService';

describe('ShopService', () => {
  const shopService = new ShopService(new LootService());

  it('extrai tier e seed do id da oferta', () => {
    expect(parseShopOfferCatalogKey('shop-8-2-armor')).toEqual({ stage: 8, seed: 2 });
    expect(parseShopOfferCatalogKey('shop-8-2-galneon-sword-rare')).toEqual({
      stage: 8,
      seed: 2,
    });
    expect(parseShopOfferCatalogKey('invalid')).toBeNull();
  });

  it('localiza oferta pelo catálogo embutido no id, mesmo com tier atual diferente', () => {
    const offers = shopService.generateOffers(5, 0);
    const offerId = offers[0].id;

    expect(shopService.findOffer(9, 0, offerId)?.id).toBe(offerId);
    expect(shopService.findOffer(9, 0, 'shop-5-0-unknown-slot')).toBeNull();
  });
});
