import { Gear, GearRarity, GearSlot } from '../entities/Gear';
import {
  GALNEON_STANDARD_SWORD_SHOP_RARITIES,
  GALNEON_STANDARD_SWORD_TEMPLATE_ID,
} from '../gear/GalneonGearCatalog';
import { LootService } from './LootService';

export interface ShopOffer {
  id: string;
  gear: Gear;
  price: number;
}

const SHOP_ACCESSORY_SLOTS: GearSlot[] = ['armor', 'accessory'];

const SHOP_RARITIES: Record<'armor' | 'accessory', GearRarity> = {
  armor: 'rare',
  accessory: 'epic',
};

const BASE_PRICE: Record<GearRarity, number> = {
  common: 25,
  uncommon: 40,
  rare: 55,
  epic: 110,
  legendary: 180,
  mythic: 300,
};

const REFRESH_BASE_COST = 15;

export class ShopService {
  constructor(private readonly lootService: LootService) {}

  generateOffers(stage: number, refreshSeed = 0): ShopOffer[] {
    const galneonSwords = GALNEON_STANDARD_SWORD_SHOP_RARITIES.map((rarity) => {
      const gear = this.lootService.generateGearFromTemplate(
        GALNEON_STANDARD_SWORD_TEMPLATE_ID,
        stage,
        rarity,
        `shop-galneon-sword-${stage}-${refreshSeed}-${rarity}`,
      );

      return {
        id: `shop-${stage}-${refreshSeed}-galneon-sword-${rarity}`,
        gear,
        price: this.calculateItemPrice(stage, rarity),
      };
    });

    const genericOffers = SHOP_ACCESSORY_SLOTS.map((slot) => {
      const rarity = SHOP_RARITIES[slot];
      const gear = this.lootService.generateDeterministicGearForSlot(stage, slot, rarity, refreshSeed);

      return {
        id: `shop-${stage}-${refreshSeed}-${slot}`,
        gear,
        price: this.calculateItemPrice(stage, rarity),
      };
    });

    return [...galneonSwords, ...genericOffers];
  }

  findOffer(stage: number, refreshSeed: number, offerId: string): ShopOffer | null {
    return this.generateOffers(stage, refreshSeed).find((offer) => offer.id === offerId) ?? null;
  }

  calculateRefreshCost(stage: number): number {
    return REFRESH_BASE_COST + Math.max(0, stage - 1) * 5;
  }

  private calculateItemPrice(stage: number, rarity: GearRarity): number {
    const stageBonus = Math.max(0, stage - 1) * (rarity === 'epic' ? 12 : rarity === 'rare' ? 8 : 5);
    return BASE_PRICE[rarity] + stageBonus;
  }
}
