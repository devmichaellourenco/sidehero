import { resolvePhase } from '../campaign/CampaignCatalog';
import { PhaseId } from '../campaign/CampaignIds';
import { spawnEnemiesForWave } from '../campaign/WaveEnemyFactory';
import { milestoneGoldScaleForPhase } from './MilestoneGoldCap';
import { referenceGoldPerPhaseForTier } from './EconomyReference';

/**
 * Teto de ouro por fase normal ≈ renda de referência do tier.
 * Fases com muitos inimigos não inflam a economia além da curva da loja.
 */
export const PHASE_GOLD_TARGET_RATIO = 1.05;

const scaleCache = new Map<PhaseId, number>();

function rawPhaseGoldTotal(phaseId: PhaseId): number {
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
    });

    total += enemies.reduce((sum, enemy) => sum + enemy.goldReward, 0);
  }

  return total;
}

export function phaseGoldScaleForPhase(phaseId: PhaseId): number {
  const phase = resolvePhase(phaseId);
  if (!phase || phase.milestoneBoss || phase.seasonFinale) {
    return 1;
  }

  const cached = scaleCache.get(phaseId);
  if (cached !== undefined) {
    return cached;
  }

  const rawTotal = rawPhaseGoldTotal(phaseId);
  const target = referenceGoldPerPhaseForTier(phase.difficultyTier) * PHASE_GOLD_TARGET_RATIO;
  const scale = rawTotal <= target ? 1 : target / rawTotal;

  scaleCache.set(phaseId, scale);
  return scale;
}

export function clearPhaseGoldScaleCache(): void {
  scaleCache.clear();
}
