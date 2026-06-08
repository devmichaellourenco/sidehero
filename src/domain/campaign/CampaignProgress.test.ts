import { describe, expect, it } from 'vitest';
import { buildPhaseId } from './CampaignIds';
import { CampaignProgress } from './CampaignProgress';

describe('CampaignProgress', () => {
  it('permite replay de fases concluídas', () => {
    const progress = CampaignProgress.initial().markCleared(buildPhaseId(1, 1), [buildPhaseId(1, 2)], 1);

    expect(progress.canPlayPhase(buildPhaseId(1, 1))).toBe(true);
    expect(progress.isCleared(buildPhaseId(1, 1))).toBe(true);
  });

  it('desbloqueia próxima fase ao marcar cleared', () => {
    const progress = CampaignProgress.initial().markCleared(buildPhaseId(1, 1), [buildPhaseId(1, 2)], 1);

    expect(progress.isUnlocked(buildPhaseId(1, 2))).toBe(true);
    expect(progress.highestTierReached).toBe(1);
  });
});
