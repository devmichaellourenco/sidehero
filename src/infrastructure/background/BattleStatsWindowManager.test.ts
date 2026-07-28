import { describe, expect, it } from 'vitest';
import {
  BATTLE_STATS_WINDOW_HEIGHT,
  BATTLE_STATS_WINDOW_WIDTH,
  getBattleStatsWindowCreateOptions,
  isBattleStatsWindowSizeLocked,
  resolveReusableWindowId,
} from './BattleStatsWindowManager';

describe('BattleStatsWindowManager', () => {
  it('reusa id quando a janela ainda está aberta', () => {
    expect(resolveReusableWindowId(42, [10, 42, 99])).toBe(42);
  });

  it('descarta id quando a janela não existe mais', () => {
    expect(resolveReusableWindowId(42, [10, 99])).toBeNull();
    expect(resolveReusableWindowId(null, [10, 99])).toBeNull();
  });

  it('monta popup 30% maior que a base 400×640 e com tamanho fixo', () => {
    expect(BATTLE_STATS_WINDOW_WIDTH).toBe(520);
    expect(BATTLE_STATS_WINDOW_HEIGHT).toBe(832);

    const options = getBattleStatsWindowCreateOptions('chrome-extension://x/panel/stats.html');
    expect(options.type).toBe('popup');
    expect(options.width).toBe(520);
    expect(options.height).toBe(832);
    expect(options.focused).toBe(true);
    expect(options.url).toContain('panel/stats.html');
    expect(isBattleStatsWindowSizeLocked(520, 832)).toBe(true);
    expect(isBattleStatsWindowSizeLocked(400, 640)).toBe(false);
  });
});
