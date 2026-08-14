import { resolvePhase } from '../campaign/CampaignCatalog';
import { PhaseId } from '../campaign/CampaignIds';
import { getPhaseRewardOverride } from '../campaign/PhaseRewardOverrides';
import { spawnEnemiesForWave } from '../campaign/WaveEnemyFactory';
import { milestoneGoldScaleForPhase } from './MilestoneGoldCap';

const scaleCache = new Map<PhaseId, number>();

function rawPhaseXpTotal(phaseId: PhaseId): number {
  const phase = resolvePhase(phaseId);
  if (!phase) return 0;

  const milestoneGoldScale = milestoneGoldScaleForPhase(phase);
  let total = 0;

  for (let waveIndex = 0; waveIndex < phase.waves.length; waveIndex += 1) {
    const wave = phase.waves[waveIndex];
    const enemies = spawnEnemiesForWave(wave, {
      phaseId,
      waveIndex,
      difficultyTier: phase.difficultyTier,
      isBossWave: waveIndex === phase.waves.length - 1,
      statMultiplier: phase.statMultiplier ?? 1,
      milestoneGoldScale,
      applyPhaseGoldBudget: false,
      applyPhaseRewardOverrides: false,
    });

    total += enemies.reduce((sum, enemy) => sum + enemy.xpReward, 0);
  }

  return total;
}

/** Escala XP dos kills para aproximar `targetXp` do override do lab (senão 1). */
export function phaseXpScaleForPhase(phaseId: PhaseId): number {
  const override = getPhaseRewardOverride(phaseId);
  const targetXp = override?.targetXp;
  if (targetXp === undefined || targetXp <= 0) {
    return 1;
  }

  const cached = scaleCache.get(phaseId);
  if (cached !== undefined) {
    return cached;
  }

  const rawTotal = rawPhaseXpTotal(phaseId);
  const scale = rawTotal <= 0 ? 1 : targetXp / rawTotal;
  scaleCache.set(phaseId, scale);
  return scale;
}

export function clearPhaseXpScaleCache(): void {
  scaleCache.clear();
}
