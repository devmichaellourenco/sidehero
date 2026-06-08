import { Gear, GearRarity, GearSlot } from '../entities/Gear';
import { LootService } from './LootService';

export interface ShopOffer {
  id: string;
  gear: Gear;
  price: number;
}

const SHOP_SLOTS: GearSlot[] = ['weapon', 'armor', 'accessory'];

const SHOP_RARITIES: Record<GearSlot, GearRarity> = {
  weapon: 'common',
  armor: 'rare',
  accessory: 'epic',
};

const BASE_PRICE: Record<GearRarity, number> = {
  common: 25,
  rare: 55,
  epic: 110,
};

export class ShopService {
  constructor(private readonly lootService: LootService) {}

  generateOffers(stage: number): ShopOffer[] {
    return SHOP_SLOTS.map((slot) => {
      const rarity = SHOP_RARITIES[slot];
      const gear = this.lootService.generateDeterministicGearForSlot(stage, slot, rarity);
      const price = this.calculatePrice(stage, rarity);

      return {
        id: `shop-${stage}-${slot}`,
        gear,
        price,
      };
    });
  }

  findOffer(stage: number, offerId: string): ShopOffer | null {
    return this.generateOffers(stage).find((offer) => offer.id === offerId) ?? null;
  }

  private calculatePrice(stage: number, rarity: GearRarity): number {
    const stageBonus = Math.max(0, stage - 1) * (rarity === 'epic' ? 12 : rarity === 'rare' ? 8 : 5);
    return BASE_PRICE[rarity] + stageBonus;
  }
}
