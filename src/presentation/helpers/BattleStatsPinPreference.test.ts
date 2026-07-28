import { describe, expect, it } from 'vitest';
import { isBattleStatsPinnedValue } from './BattleStatsPinPreference';

describe('BattleStatsPinPreference', () => {
  it('considera apenas true como fixado (padrão = janela)', () => {
    expect(isBattleStatsPinnedValue(true)).toBe(true);
    expect(isBattleStatsPinnedValue(false)).toBe(false);
    expect(isBattleStatsPinnedValue(undefined)).toBe(false);
    expect(isBattleStatsPinnedValue('1')).toBe(false);
  });
});
