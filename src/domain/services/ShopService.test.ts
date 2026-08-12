import { describe, expect, it } from 'vitest';
import { GEAR_RARITIES } from '../entities/Gear';
import { mainMissionId } from '../campaign/missions/MissionId';
import { LootService } from './LootService';
import {
  getShopMaxRarityForProgress,
  getShopMaxRarityIndex,
  rollShopRarity,
  SHOP_OFFER_COUNT,
} from '../shop/ShopCatalog';
import { parseShopOfferCatalogKey, ShopService } from './ShopService';

describe('ShopService', () => {
  const shopService = new ShopService(new LootService());

  it('extrai tier e seed do id da oferta', () => {
    expect(parseShopOfferCatalogKey('shop-8-2-o3')).toEqual({ stage: 8, seed: 2 });
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
    expect(shopService.findOffer(9, 0, 'shop-5-0-o99')).toBeNull();
  });

  it('gera oito ofertas variadas por estoque', () => {
    const offers = shopService.generateOffers(12, 0);

    expect(offers).toHaveLength(SHOP_OFFER_COUNT);
    expect(new Set(offers.map((offer) => offer.id)).size).toBe(SHOP_OFFER_COUNT);
    expect(new Set(offers.map((offer) => offer.gear.templateId)).size).toBeGreaterThan(3);
  });

  it('estoque diferente após renovar seed', () => {
    const first = shopService.generateOffers(10, 0);
    const second = shopService.generateOffers(10, 1);

    expect(first.map((offer) => offer.gear.templateId)).not.toEqual(
      second.map((offer) => offer.gear.templateId),
    );
  });

  it('sem mains concluídas não vende acima de uncommon', () => {
    for (let seed = 0; seed < 5; seed += 1) {
      const offers = shopService.generateOffers(1, seed, []);
      for (const offer of offers) {
        expect(GEAR_RARITIES.indexOf(offer.gear.rarity)).toBeLessThanOrEqual(
          getShopMaxRarityIndex([]),
        );
      }
    }
  });

  it('preço escala com tier e raridade', () => {
    const common = shopService.calculateItemPrice(1, 'common');
    const epic = shopService.calculateItemPrice(1, 'epic');
    const epicLate = shopService.calculateItemPrice(30, 'epic');

    expect(epic).toBeGreaterThan(common);
    expect(epicLate).toBeGreaterThan(epic);
  });
});

describe('ShopCatalog balance — caps por main', () => {
  it('cap de raridade evolui com mains concluídas', () => {
    expect(getShopMaxRarityForProgress([])).toBe('uncommon');
    expect(getShopMaxRarityForProgress([mainMissionId('1-1')])).toBe('uncommon');
    expect(getShopMaxRarityForProgress([mainMissionId('1-5')])).toBe('rare');
    expect(getShopMaxRarityForProgress([mainMissionId('1-50')])).toBe('epic');
    expect(getShopMaxRarityForProgress([mainMissionId('2-1')])).toBe('epic');
    expect(getShopMaxRarityForProgress([mainMissionId('2-50')])).toBe('legendary');
    expect(getShopMaxRarityForProgress([mainMissionId('3-1')])).toBe('legendary');
    expect(getShopMaxRarityForProgress([mainMissionId('3-21')])).toBe('mythic');
    expect(getShopMaxRarityForProgress([], 121)).toBe('mythic');
  });

  it('não vende mythic antes do Ato 3 de Valdris', () => {
    const shop = new ShopService(new LootService());
    const mains = [mainMissionId('3-1')];
    for (let seed = 0; seed < 20; seed += 1) {
      const offers = shop.generateOffers(120, seed, mains);
      expect(offers.every((offer) => offer.gear.rarity !== 'mythic')).toBe(true);
    }
  });

  it('rollShopRarity respeita cap das mains', () => {
    const mains = [mainMissionId('1-5')];
    for (let index = 0; index < SHOP_OFFER_COUNT; index += 1) {
      const rarity = rollShopRarity(5, 0, index, mains);
      expect(GEAR_RARITIES.indexOf(rarity)).toBeLessThanOrEqual(getShopMaxRarityIndex(mains));
    }
  });
});
