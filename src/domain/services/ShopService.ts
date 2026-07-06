import { Gear, GearRarity } from '../entities/Gear';
import {
  buildShopOfferId,
  pickUniqueShopTemplateId,
  rollShopRarity,
  SHOP_OFFER_COUNT,
  SHOP_SLOT_BY_INDEX,
} from '../shop/ShopCatalog';
import { calculateShopItemPrice, calculateShopRefreshCost } from '../shop/ShopPricing';
import { LootService } from './LootService';

export interface ShopOffer {
  id: string;
  gear: Gear;
  price: number;
}

export { calculateShopItemPrice, calculateShopRefreshCost } from '../shop/ShopPricing';

export function parseShopOfferCatalogKey(
  offerId: string,
): { stage: number; seed: number } | null {
  const match = offerId.match(/^shop-(\d+)-(\d+)-/);
  if (!match) return null;

  return {
    stage: Number(match[1]),
    seed: Number(match[2]),
  };
}

export class ShopService {
  constructor(private readonly lootService: LootService) {}

  generateOffers(tier: number, refreshSeed = 0): ShopOffer[] {
    const usedTemplateKeys = new Set<string>();
    const offers: ShopOffer[] = [];

    for (let offerIndex = 0; offerIndex < SHOP_OFFER_COUNT; offerIndex += 1) {
      const slot = SHOP_SLOT_BY_INDEX[offerIndex];
      const rarity = rollShopRarity(tier, refreshSeed, offerIndex);
      const templateId = pickUniqueShopTemplateId(
        slot,
        tier,
        refreshSeed,
        offerIndex,
        usedTemplateKeys,
      );
      usedTemplateKeys.add(`${slot}:${templateId}`);

      const gearId = `shop-gear-${tier}-${refreshSeed}-${offerIndex}`;
      const gear = this.lootService.generateGearFromTemplate(
        templateId,
        tier,
        rarity,
        gearId,
        offerIndex % 3,
      );

      offers.push({
        id: buildShopOfferId(tier, refreshSeed, offerIndex),
        gear,
        price: this.calculateItemPrice(tier, rarity),
      });
    }

    return offers;
  }

  findOffer(tier: number, refreshSeed: number, offerId: string): ShopOffer | null {
    const catalog = parseShopOfferCatalogKey(offerId);
    const resolvedTier = catalog?.stage ?? tier;
    const resolvedSeed = catalog?.seed ?? refreshSeed;

    return (
      this.generateOffers(resolvedTier, resolvedSeed).find((offer) => offer.id === offerId) ??
      null
    );
  }

  calculateRefreshCost(tier: number): number {
    return calculateShopRefreshCost(tier);
  }

  calculateItemPrice(tier: number, rarity: GearRarity): number {
    return calculateShopItemPrice(tier, rarity);
  }
}
