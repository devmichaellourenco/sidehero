/**
 * Auditoria de economia — ouro por fase + preços de loja + custo de renovação.
 */
import { buildPhaseId, type MapId } from '../../src/domain/campaign/CampaignIds';
import { CAMPAIGN_MAPS } from '../../src/domain/campaign/CampaignMaps';
import { BASE_GAME_MAX_MAP_INDEX } from '../../src/domain/campaign/CampaignReleaseScope';
import {
  chapterMainPhaseForPhaseNumber,
  listMissionChapterOptions,
} from '../../src/domain/campaign/missions/NormalMissionMainBand';
import { resolvePhase } from '../../src/domain/campaign/CampaignCatalog';
import { spawnEnemiesForWave } from '../../src/domain/campaign/WaveEnemyFactory';
import { milestoneGoldScaleForPhase } from '../../src/domain/balance/MilestoneGoldCap';
import {
  calculateShopItemPrice,
  calculateShopRefreshCost,
} from '../../src/domain/shop/ShopPricing';
import {
  listConfiguredShops,
  shopProgressionTier,
} from '../../src/domain/shop/ConfigurableShopCatalog';
import { getGearCatalogItem } from '../../src/domain/gear/GearItemCatalog';
import { phaseIdFromMainMissionId } from '../../src/domain/campaign/missions/MissionId';

export interface EconomyPhaseRow {
  phaseId: string;
  phaseNumber: number;
  chapterMainPhase: number;
  displayName: string;
  goldTotal: number;
  waveCount: number;
  enemyCount: number;
}

export interface EconomyShopRow {
  shopId: string;
  shopName: string;
  tier: number;
  refreshCost: number;
  items: Array<{
    id: string;
    name: string;
    rarity: string;
    basePrice: number;
    effectivePrice: number;
  }>;
}

export interface EconomyMapRow {
  mapId: MapId;
  mapName: string;
  mapIndex: number;
  phases: EconomyPhaseRow[];
  goldTotal: number;
  shops: EconomyShopRow[];
}

export interface EconomyAuditPayload {
  maps: EconomyMapRow[];
  chapters: ReturnType<typeof listMissionChapterOptions>;
}

function sumPhaseGold(phaseId: string): { goldTotal: number; enemyCount: number } | null {
  const phase = resolvePhase(phaseId);
  if (!phase) return null;

  const milestoneGoldScale = milestoneGoldScaleForPhase(phase);
  let goldTotal = 0;
  let enemyCount = 0;

  for (let waveIndex = 0; waveIndex < phase.waves.length; waveIndex += 1) {
    const wave = phase.waves[waveIndex];
    const enemies = spawnEnemiesForWave(wave, {
      phaseId,
      waveIndex,
      difficultyTier: phase.difficultyTier,
      isBossWave: waveIndex === phase.waves.length - 1,
      statMultiplier: phase.statMultiplier ?? 1,
      milestoneGoldScale,
      applyPhaseRewardOverrides: true,
    });
    enemyCount += enemies.length;
    for (const enemy of enemies) {
      goldTotal += enemy.goldReward;
    }
  }

  return { goldTotal, enemyCount };
}

function buildShopRows(mapIndex: number): EconomyShopRow[] {
  const shops = listConfiguredShops().filter((shop) => {
    const phaseId = phaseIdFromMainMissionId(shop.unlockAfterMainId);
    const mi = phaseId ? Number(phaseId.split('-')[0]) : 0;
    return mi === mapIndex;
  });

  return shops.map((shop) => {
    const tier = shopProgressionTier(shop.unlockAfterMainId);
    return {
      shopId: shop.id,
      shopName: shop.name,
      tier,
      refreshCost: calculateShopRefreshCost(tier),
      items: shop.catalogItemIds.flatMap((itemId) => {
        const item = getGearCatalogItem(itemId);
        if (!item) return [];
        const effectivePrice = calculateShopItemPrice(item.basePrice, [
          { multiplier: shop.priceMultiplier, flatAdjustment: shop.flatPriceAdjustment },
        ]);
        return [
          {
            id: itemId,
            name: item.name,
            rarity: item.rarity,
            basePrice: item.basePrice,
            effectivePrice,
          },
        ];
      }),
    };
  });
}

export function buildEconomyAuditPayload(filters?: {
  mapIndex?: number;
  chapterMain?: number;
}): EconomyAuditPayload {
  const maps: EconomyMapRow[] = [];

  for (const mapDef of CAMPAIGN_MAPS) {
    const mi = mapDef.mapIndex;
    if (mi > BASE_GAME_MAX_MAP_INDEX) continue;
    if (filters?.mapIndex !== undefined && filters.mapIndex !== mi) continue;

    const phases: EconomyPhaseRow[] = [];
    let goldTotal = 0;

    const maxPhase = 30;
    for (let phaseNumber = 1; phaseNumber <= maxPhase; phaseNumber += 1) {
      const chapterMainPhase = chapterMainPhaseForPhaseNumber(phaseNumber);
      if (filters?.chapterMain !== undefined && filters.chapterMain !== chapterMainPhase) continue;

      const phaseId = buildPhaseId(mi, phaseNumber);
      const phase = resolvePhase(phaseId);
      if (!phase) continue;

      const goldData = sumPhaseGold(phaseId);
      if (!goldData) continue;

      phases.push({
        phaseId,
        phaseNumber,
        chapterMainPhase,
        displayName: phase.displayName,
        goldTotal: goldData.goldTotal,
        waveCount: phase.waves.length,
        enemyCount: goldData.enemyCount,
      });
      goldTotal += goldData.goldTotal;
    }

    maps.push({
      mapId: mapDef.id as MapId,
      mapName: mapDef.name,
      mapIndex: mi,
      phases,
      goldTotal,
      shops: buildShopRows(mi),
    });
  }

  return { maps, chapters: listMissionChapterOptions() };
}
