import { describe, expect, it } from 'vitest';
import { buildPhaseId } from './CampaignIds';
import { CampaignProgress } from './CampaignProgress';
import {
  grantsPhaseChests,
  isPhaseReplay,
  scalePhaseGold,
  scalePhaseXp,
} from './PhaseLootPolicy';

describe('PhaseLootPolicy', () => {
  it('concede baús na primeira conclusão', () => {
    const progress = CampaignProgress.initial();
    expect(grantsPhaseChests(progress, buildPhaseId(1, 1))).toBe(true);
    expect(isPhaseReplay(progress, buildPhaseId(1, 1))).toBe(false);
  });

  it('bloqueia baús ao repetir fase já cleared', () => {
    const progress = CampaignProgress.initial().markCleared(buildPhaseId(1, 2), [buildPhaseId(1, 3)], 2);
    expect(grantsPhaseChests(progress, buildPhaseId(1, 2))).toBe(false);
    expect(isPhaseReplay(progress, buildPhaseId(1, 2))).toBe(true);
  });

  it('aplica 50% ouro e 75% XP na repetição', () => {
    const progress = CampaignProgress.initial().markCleared(buildPhaseId(1, 2), [buildPhaseId(1, 3)], 2);
    const phaseId = buildPhaseId(1, 2);

    expect(scalePhaseGold(100, progress, phaseId)).toBe(50);
    expect(scalePhaseXp(100, progress, phaseId)).toBe(75);
  });

  it('mantém 100% ouro e XP na primeira conclusão', () => {
    const progress = CampaignProgress.initial();
    const phaseId = buildPhaseId(1, 1);

    expect(scalePhaseGold(100, progress, phaseId)).toBe(100);
    expect(scalePhaseXp(100, progress, phaseId)).toBe(100);
  });
});
