import { describe, expect, it } from 'vitest';
import { MEDIEVAL_THEME } from './MedievalThemeTokens';

describe('MedievalThemeTokens', () => {
  it('preserva paleta canônica do tutorial (ouro, pergaminho, tinta, floresta)', () => {
    expect(MEDIEVAL_THEME.sealGold).toBe('#c9a227');
    expect(MEDIEVAL_THEME.sealGoldDark).toBe('#8a6510');
    expect(MEDIEVAL_THEME.parchment0).toBe('#fff9ed');
    expect(MEDIEVAL_THEME.parchment1).toBe('#f3e4bc');
    expect(MEDIEVAL_THEME.parchment2).toBe('#e8d4a0');
    expect(MEDIEVAL_THEME.ink).toBe('#1f1710');
    expect(MEDIEVAL_THEME.inkMuted).toBe('#3d3428');
    expect(MEDIEVAL_THEME.forest).toBe('#2f6b38');
    expect(MEDIEVAL_THEME.forestHi).toBe('#3f8a49');
  });

  it('define chrome claro (pergaminho) com texto tinta', () => {
    expect(MEDIEVAL_THEME.bg).toBe('#f3e4bc');
    expect(MEDIEVAL_THEME.surface).toBe('#fff9ed');
    expect(MEDIEVAL_THEME.text).toBe('#1f1710');
    expect(MEDIEVAL_THEME.muted).toBe('#3d3428');
    expect(MEDIEVAL_THEME.accent).toBe('#8b3a2f');
    expect(MEDIEVAL_THEME.bg).toBe(MEDIEVAL_THEME.parchment1);
    expect(MEDIEVAL_THEME.surface).toBe(MEDIEVAL_THEME.parchment0);
  });
});
