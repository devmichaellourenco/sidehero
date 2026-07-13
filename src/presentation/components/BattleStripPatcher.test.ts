import { describe, expect, it } from 'vitest';
import { shouldUseCrowdedBattleStrip } from './BattleStripPatcher';

describe('shouldUseCrowdedBattleStrip', () => {
  it('mantém layout grande independente da quantidade de combatentes', () => {
    expect(shouldUseCrowdedBattleStrip(3, 2)).toBe(false);
    expect(shouldUseCrowdedBattleStrip(2, 3)).toBe(false);
    expect(shouldUseCrowdedBattleStrip(3, 1)).toBe(false);
    expect(shouldUseCrowdedBattleStrip(2, 1)).toBe(false);
  });
});
