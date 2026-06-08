import { getFeatureLevel, UpgradeLevels } from './FeatureKey';

const REFRESH_LIMITS: Record<number, number> = {
  1: 2,
  2: 5,
  3: 8,
};

export function getShopRefreshLimit(levels: UpgradeLevels): number {
  const level = getFeatureLevel(levels, 'shop_refresh');
  return REFRESH_LIMITS[level] ?? 0;
}

export function getShopRefreshDiscount(levels: UpgradeLevels): number {
  const level = getFeatureLevel(levels, 'shop_refresh');
  return level >= 3 ? 0.85 : 1;
}

export function calculateShopRefreshCost(stage: number, levels: UpgradeLevels): number {
  const base = 15 + Math.max(0, stage - 1) * 5;
  return Math.floor(base * getShopRefreshDiscount(levels));
}

export function canRefreshShop(state: {
  upgradeLevels: UpgradeLevels;
  shopRefreshUses: number;
  gold: { canAfford: (cost: number) => boolean };
  stage: number;
}): boolean {
  const limit = getShopRefreshLimit(state.upgradeLevels);
  if (getFeatureLevel(state.upgradeLevels, 'shop_refresh') < 1) return false;
  if (state.shopRefreshUses >= limit) return false;
  const cost = calculateShopRefreshCost(state.stage, state.upgradeLevels);
  return state.gold.canAfford(cost);
}
