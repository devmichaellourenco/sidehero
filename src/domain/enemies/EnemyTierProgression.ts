import { difficultyTierForPhase } from '../campaign/CampaignIds';
import {
  EnemyPowerTier,
  EnemyRosterEntry,
  EnemyType,
  getBossForPowerTier,
  getCommonsForPowerTier,
  getSubbossesForPowerTier,
} from './EnemyRosterCatalog';

export function getPowerTierForGlobalTier(globalTier: number): EnemyPowerTier {
  return Math.min(5, Math.max(1, Math.ceil(globalTier / 100))) as EnemyPowerTier;
}

/** Índice 0–99 dentro do bloco de 100 tiers do nível atual. */
export function indexWithinPowerTier(globalTier: number): number {
  return (globalTier - 1) % 100;
}

/** Mapa 1 ou 2 dentro do par de mapas do nível. */
export function mapHalfWithinPowerTier(globalTier: number): 1 | 2 {
  return indexWithinPowerTier(globalTier) < 50 ? 1 : 2;
}

export function unlockedCommonsForGlobalTier(globalTier: number): EnemyRosterEntry[] {
  const powerTier = getPowerTierForGlobalTier(globalTier);
  const commons = getCommonsForPowerTier(powerTier);
  const indexInLevel = indexWithinPowerTier(globalTier);
  const half = mapHalfWithinPowerTier(globalTier);
  const halfCount = Math.ceil(commons.length / 2);

  if (half === 2) {
    return commons;
  }

  const phaseInMap = ((globalTier - 1) % 50) + 1;
  const unlockCount = Math.min(halfCount, Math.max(2, Math.ceil((phaseInMap / 50) * halfCount)));
  return commons.slice(0, unlockCount);
}

export function pickCommonForGlobalTier(globalTier: number, offset: number): EnemyType {
  const pool = unlockedCommonsForGlobalTier(globalTier);
  if (pool.length === 0) return getCommonsForPowerTier(getPowerTierForGlobalTier(globalTier))[0].id;
  return pool[(globalTier + offset) % pool.length].id;
}

export function pickSubbossForGlobalTier(globalTier: number, offset: number): EnemyType {
  const subs = getSubbossesForPowerTier(getPowerTierForGlobalTier(globalTier));
  return subs[(globalTier + offset) % subs.length].id;
}

export function pickLevelBossForGlobalTier(globalTier: number): EnemyType {
  return getBossForPowerTier(getPowerTierForGlobalTier(globalTier)).id;
}

export function milestoneBossForMapIndex(mapIndex: number): EnemyType {
  const milestoneByMap: Record<number, EnemyType> = {
    1: 'saci',
    2: 'hill_ogre',
    3: 'bloody_orc_chief',
    4: 'mountain_troll',
    5: 'three_head_hydra',
    6: 'young_green_dragon',
    7: 'lesser_lich',
    8: 'awakened_titan',
    9: 'demon_prince',
    10: 'fallen_magic_god',
  };
  return milestoneByMap[mapIndex] ?? pickLevelBossForGlobalTier(difficultyTierForPhase(mapIndex, 50));
}
