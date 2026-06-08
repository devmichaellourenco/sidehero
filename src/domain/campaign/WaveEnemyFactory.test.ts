import { describe, expect, it } from 'vitest';
import { difficultyScale } from './WaveEnemyFactory';

describe('difficultyScale', () => {
  it('cresce de forma agressiva em tiers altos', () => {
    const early = difficultyScale(5);
    const mid = difficultyScale(50);
    const late = difficultyScale(200);
    const finale = difficultyScale(500, 1.85);

    expect(mid).toBeGreaterThan(early * 3);
    expect(late).toBeGreaterThan(mid * 3);
    expect(finale).toBeGreaterThan(late * 1.5);
  });
});
