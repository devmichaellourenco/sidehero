import { afterEach, describe, expect, it } from 'vitest';
import { clearPhaseGoldScaleCache } from '../balance/PhaseGoldBudget';
import { clearPhaseXpScaleCache, phaseXpScaleForPhase } from '../balance/PhaseXpBudget';
import { resolvePhase } from './CampaignCatalog';
import { buildPhaseId } from './CampaignIds';
import {
  normalizePhaseRewardOverride,
  setRuntimePhaseRewardOverrides,
} from './PhaseRewardOverrides';
import { spawnEnemiesForWave } from './WaveEnemyFactory';
import { milestoneGoldScaleForPhase } from '../balance/MilestoneGoldCap';

function sumPhaseXp(phaseId: string, applyOverrides: boolean): number {
  const phase = resolvePhase(phaseId);
  if (!phase) return 0;
  const milestoneGoldScale = milestoneGoldScaleForPhase(phase);
  let total = 0;
  for (let waveIndex = 0; waveIndex < phase.waves.length; waveIndex += 1) {
    const enemies = spawnEnemiesForWave(phase.waves[waveIndex], {
      phaseId,
      waveIndex,
      difficultyTier: phase.difficultyTier,
      isBossWave: waveIndex === phase.waves.length - 1,
      statMultiplier: phase.statMultiplier ?? 1,
      milestoneGoldScale,
      applyPhaseRewardOverrides: applyOverrides,
    });
    total += enemies.reduce((sum, enemy) => sum + enemy.xpReward, 0);
  }
  return total;
}

describe('PhaseRewardOverrides', () => {
  afterEach(() => {
    setRuntimePhaseRewardOverrides(null);
    clearPhaseXpScaleCache();
    clearPhaseGoldScaleCache();
  });

  it('normalizePhaseRewardOverride aceita nome e/ou alvos', () => {
    expect(normalizePhaseRewardOverride({})).toBeNull();
    expect(normalizePhaseRewardOverride({ targetXp: 0 })).toBeNull();
    expect(normalizePhaseRewardOverride({ displayName: '  ' })).toBeNull();
    expect(normalizePhaseRewardOverride({ displayName: ' Estrada ' })).toEqual({
      displayName: 'Estrada',
      targetXp: undefined,
      targetGold: undefined,
    });
    expect(normalizePhaseRewardOverride({ targetXp: 40, targetGold: 12 })).toEqual({
      displayName: undefined,
      targetXp: 40,
      targetGold: 12,
    });
  });

  it('aplica displayName do override em resolvePhase', () => {
    const phaseId = buildPhaseId(1, 1);
    const baseline = resolvePhase(phaseId);
    expect(baseline).not.toBeNull();

    setRuntimePhaseRewardOverrides({
      [phaseId]: { displayName: 'Nome do Lab' },
    });
    clearPhaseXpScaleCache();
    clearPhaseGoldScaleCache();

    expect(resolvePhase(phaseId)?.displayName).toBe('Nome do Lab');
  });

  it('escala XP dos kills da fase para aproximar targetXp', () => {
    const phaseId = buildPhaseId(1, 1);
    const baselineXp = sumPhaseXp(phaseId, false);
    expect(baselineXp).toBeGreaterThan(0);

    const targetXp = Math.max(baselineXp * 3, baselineXp + 10);
    setRuntimePhaseRewardOverrides({ [phaseId]: { targetXp } });
    clearPhaseXpScaleCache();
    clearPhaseGoldScaleCache();

    expect(phaseXpScaleForPhase(phaseId)).toBeCloseTo(targetXp / baselineXp, 5);

    const scaledXp = sumPhaseXp(phaseId, true);
    expect(scaledXp).toBeGreaterThanOrEqual(targetXp - 5);
    expect(scaledXp).toBeLessThanOrEqual(targetXp);
  });

  it('não entra em recursão ao escalar XP de milestone com targetXp', () => {
    const phaseId = buildPhaseId(1, 50);
    const phase = resolvePhase(phaseId);
    expect(phase?.milestoneBoss || phase?.seasonFinale).toBeTruthy();

    const baselineXp = sumPhaseXp(phaseId, false);
    expect(baselineXp).toBeGreaterThan(0);

    setRuntimePhaseRewardOverrides({ [phaseId]: { targetXp: Math.max(baselineXp * 2, 40) } });
    clearPhaseXpScaleCache();
    clearPhaseGoldScaleCache();

    expect(() => phaseXpScaleForPhase(phaseId)).not.toThrow();
    expect(phaseXpScaleForPhase(phaseId)).toBeGreaterThan(0);
    expect(() => sumPhaseXp(phaseId, true)).not.toThrow();
  });
});
