import { describe, expect, it } from 'vitest';
import { stageScalingFactorsForTier } from '../progression/StageScalingCatalog';

describe('stageScalingFactorsForTier', () => {
  it('cresce de forma agressiva em tiers altos', () => {
    const early = stageScalingFactorsForTier(5);
    const mid = stageScalingFactorsForTier(50);
    const late = stageScalingFactorsForTier(200);
    const finale = stageScalingFactorsForTier(500, 1.85);

    expect(mid.atk).toBeGreaterThan(early.atk * 3);
    expect(late.hp).toBeGreaterThan(mid.hp * 3);
    expect(finale.atk).toBeGreaterThan(late.atk * 1.5);
  });
});
