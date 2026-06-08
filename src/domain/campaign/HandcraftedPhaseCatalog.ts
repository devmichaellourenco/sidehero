import { EnemyType, ENEMY_DEFINITIONS } from '../entities/EnemyType';
import { CAMPAIGN_MAPS, TOTAL_CAMPAIGN_PHASES } from './CampaignMaps';
import {
  buildPhaseId,
  difficultyTierForPhase,
  isMilestonePhase,
  isSeasonFinalePhase,
} from './CampaignIds';
import { applyMilestoneBlueprint, getMilestoneBlueprint } from './MilestonePhaseBlueprints';
import { PhaseDefinition } from './PhaseDefinition';
import { EnemySlot, WaveDefinition } from './WaveDefinition';

function wave(id: string, slots: EnemySlot[], goldMultiplier = 1): WaveDefinition {
  return { id, slots, goldMultiplier };
}

function trash(type: EnemyType, count = 1): EnemySlot {
  return { enemyType: type, role: 'trash', count };
}

function elite(type: EnemyType, count = 1): EnemySlot {
  return { enemyType: type, role: 'elite', count };
}

function boss(type: EnemyType, count = 1): EnemySlot {
  return { enemyType: type, role: 'boss', count };
}

function pickEnemyType(globalTier: number, offset: number): EnemyType {
  const index = Math.floor(globalTier / 8) + offset;
  return ENEMY_DEFINITIONS[index % ENEMY_DEFINITIONS.length].type;
}

function bossTypeForTier(globalTier: number): EnemyType {
  if (globalTier >= 400) return 'dragon';
  if (globalTier >= 250) return 'wraith';
  if (globalTier >= 120) return 'orc';
  if (globalTier >= 40) return 'goblin';
  return 'slime';
}

function buildUnlocks(mapIndex: number, phaseNumber: number): string[] {
  if (phaseNumber < 50) {
    return [buildPhaseId(mapIndex, phaseNumber + 1)];
  }

  if (mapIndex < CAMPAIGN_MAPS.length) {
    return [buildPhaseId(mapIndex + 1, 1)];
  }

  return [];
}

function buildWaves(
  mapIndex: number,
  phaseNumber: number,
  globalTier: number,
  milestoneBoss: boolean,
  seasonFinale: boolean,
): WaveDefinition[] {
  if (seasonFinale) {
    return [
      wave('w1', [trash(pickEnemyType(globalTier, 0), 3), trash(pickEnemyType(globalTier, 1), 2)]),
      wave('w2', [elite(bossTypeForTier(globalTier), 2), trash(pickEnemyType(globalTier, 2), 2)], 1.2),
      wave('w3', [elite(bossTypeForTier(globalTier), 2), elite(pickEnemyType(globalTier, 3))], 1.3),
      wave('w4', [boss('dragon'), boss('wraith')], 2),
    ];
  }

  if (milestoneBoss) {
    const bossEnemy = bossTypeForTier(globalTier);
    return [
      wave('w1', [trash(pickEnemyType(globalTier, 0), 2), trash(pickEnemyType(globalTier, 1), 2)]),
      wave('w2', [elite(pickEnemyType(globalTier, 2)), trash(pickEnemyType(globalTier, 3), 2)], 1.15),
      wave('w3', [elite(bossEnemy), elite(pickEnemyType(globalTier, 4))], 1.25),
      wave('w4', [boss(bossEnemy), elite(pickEnemyType(globalTier, 1))], 1.6),
    ];
  }

  const waveCount =
    phaseNumber === 1
      ? 1
      : Math.min(4, Math.max(2, 1 + Math.floor(phaseNumber / 10)));
  const waves: WaveDefinition[] = [];

  for (let index = 0; index < waveCount; index++) {
    const isBoss = index === waveCount - 1;
    const enemyType = isBoss ? bossTypeForTier(globalTier) : pickEnemyType(globalTier, index);
    const count = isBoss ? 1 : 1 + (index % 2);

    if (isBoss) {
      waves.push(wave(`w${index + 1}`, [boss(enemyType, count)], 1.2));
      continue;
    }

    const role = index === waveCount - 2 && waveCount >= 3 ? 'elite' : 'trash';
    const slot = role === 'elite' ? elite(enemyType, count) : trash(enemyType, count);
    waves.push(wave(`w${index + 1}`, [slot]));
  }

  return waves;
}

function buildPhase(mapIndex: number, phaseNumber: number): PhaseDefinition {
  const map = CAMPAIGN_MAPS.find((entry) => entry.mapIndex === mapIndex)!;
  const phaseId = buildPhaseId(mapIndex, phaseNumber);
  const globalTier = difficultyTierForPhase(mapIndex, phaseNumber);
  const milestoneBoss = isMilestonePhase(phaseNumber);
  const seasonFinale = isSeasonFinalePhase(phaseId);

  let statMultiplier = 1;
  if (seasonFinale) statMultiplier = 1.85;
  else if (milestoneBoss) statMultiplier = 1.45;
  else if (phaseNumber > 35) statMultiplier = 1.12;
  else if (phaseNumber > 20) statMultiplier = 1.06;

  let phase: PhaseDefinition = {
    id: phaseId,
    campaignId: 'apprentice',
    mapId: map.id,
    displayName: `${map.name} ${phaseNumber}`,
    difficultyTier: globalTier,
    waves: buildWaves(mapIndex, phaseNumber, globalTier, milestoneBoss, seasonFinale),
    unlocks: buildUnlocks(mapIndex, phaseNumber),
    milestoneBoss,
    seasonFinale,
    statMultiplier,
  };

  if (milestoneBoss) {
    const blueprint = getMilestoneBlueprint(phaseId);
    if (blueprint) {
      phase = applyMilestoneBlueprint(phase, blueprint);
    }
  }

  return phase;
}

function buildHandcraftedCatalog(): PhaseDefinition[] {
  const phases: PhaseDefinition[] = [];

  for (const map of CAMPAIGN_MAPS) {
    for (let phaseNumber = 1; phaseNumber <= map.phaseCount; phaseNumber++) {
      phases.push(buildPhase(map.mapIndex, phaseNumber));
    }
  }

  return phases;
}

export const HANDCRAFTED_PHASES = buildHandcraftedCatalog();

export function assertHandcraftedCatalog(): void {
  if (HANDCRAFTED_PHASES.length !== TOTAL_CAMPAIGN_PHASES) {
    throw new Error(`Catálogo esperava ${TOTAL_CAMPAIGN_PHASES} fases, obteve ${HANDCRAFTED_PHASES.length}`);
  }
}

assertHandcraftedCatalog();
