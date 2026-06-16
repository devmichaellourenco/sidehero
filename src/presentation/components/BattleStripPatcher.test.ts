import { describe, expect, it } from 'vitest';
import { shouldUseCrowdedBattleStrip } from './BattleStripPatcher';

describe('shouldUseCrowdedBattleStrip', () => {
  it('ativa com 5 ou mais combatentes no total', () => {
    expect(shouldUseCrowdedBattleStrip(3, 2)).toBe(true);
    expect(shouldUseCrowdedBattleStrip(2, 3)).toBe(true);
  });

  it('ativa com 3 heróis e 2 inimigos', () => {
    expect(shouldUseCrowdedBattleStrip(3, 2)).toBe(true);
  });

  it('não ativa em composições menores', () => {
    expect(shouldUseCrowdedBattleStrip(2, 1)).toBe(false);
    expect(shouldUseCrowdedBattleStrip(3, 1)).toBe(false);
  });
});
