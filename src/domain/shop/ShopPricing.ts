import { GearRarity } from '../entities/Gear';
import {
  referenceGoldPerPhaseForTier,
  shopPhasesToAffordForRarity,
} from '../balance/EconomyReference';

const REFRESH_BASE_COST = 15;

export function calculateShopItemPrice(tier: number, rarity: GearRarity): number {
  const referenceGold = referenceGoldPerPhaseForTier(tier);
  const phases = shopPhasesToAffordForRarity(tier, rarity);
  return Math.max(1, Math.floor(referenceGold * phases));
}

export function calculateShopRefreshCost(tier: number): number {
  return REFRESH_BASE_COST + Math.max(0, tier - 1) * 5;
}
