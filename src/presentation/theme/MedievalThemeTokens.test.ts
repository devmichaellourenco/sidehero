import { describe, expect, it } from 'vitest';
import { MEDIEVAL_THEME, MEDIEVAL_THEME_SEMANTICS } from './MedievalThemeTokens';

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

  it('define semântica legível no claro (dano, info, crítico, elementos)', () => {
    expect(MEDIEVAL_THEME.danger).toBe('#8a2828');
    expect(MEDIEVAL_THEME.info).toBe('#1a5a8a');
    expect(MEDIEVAL_THEME.crit).toBe(MEDIEVAL_THEME.sealGoldDark);
    expect(MEDIEVAL_THEME.elementFire).toBe('#b85a10');
    expect(MEDIEVAL_THEME.elementCold).toBe('#156a8a');
    expect(MEDIEVAL_THEME.elementLightning).toBe('#8a7010');
    expect(MEDIEVAL_THEME.elementChaos).toBe('#6a3a8a');
  });

  it('mapeia aliases semânticos para tokens canônicos', () => {
    expect(MEDIEVAL_THEME[MEDIEVAL_THEME_SEMANTICS.damage]).toBe(MEDIEVAL_THEME.danger);
    expect(MEDIEVAL_THEME[MEDIEVAL_THEME_SEMANTICS.heal]).toBe(MEDIEVAL_THEME.forest);
    expect(MEDIEVAL_THEME[MEDIEVAL_THEME_SEMANTICS.critical]).toBe(MEDIEVAL_THEME.crit);
    expect(MEDIEVAL_THEME[MEDIEVAL_THEME_SEMANTICS.mitigation]).toBe(MEDIEVAL_THEME.info);
    expect(MEDIEVAL_THEME[MEDIEVAL_THEME_SEMANTICS.inventoryUpgrade]).toBe(
      MEDIEVAL_THEME.badgeUpgradeFill,
    );
  });

  it('separa tokens por contexto mesmo quando o hex coincide', () => {
    expect(MEDIEVAL_THEME.floatLightning).toBe(MEDIEVAL_THEME.floatCritHeal);
    expect(MEDIEVAL_THEME.floatLightning).not.toBe(MEDIEVAL_THEME.floatCrit);
    expect(MEDIEVAL_THEME.floatCrit).toBe(MEDIEVAL_THEME.floatCritBuff);
    expect(MEDIEVAL_THEME.xpFillEnd).toBe(MEDIEVAL_THEME.waveMarkerGoldLabel);
    expect(MEDIEVAL_THEME.badgeDowngradeFill).toBe(MEDIEVAL_THEME.mapCrimsonAbyss);
    expect(MEDIEVAL_THEME.metaOwnedLabel).toBe(MEDIEVAL_THEME.rosterActiveLabel);
    expect(MEDIEVAL_THEME.toastVictoryDeep).toBe(MEDIEVAL_THEME.metaCtaDeep);
    // chaves distintas = temas futuros podem divergir por contexto
    expect('floatLightning' in MEDIEVAL_THEME).toBe(true);
    expect('floatCritHeal' in MEDIEVAL_THEME).toBe(true);
    expect('mapCrimsonAbyss' in MEDIEVAL_THEME).toBe(true);
    expect('badgeDowngradeFill' in MEDIEVAL_THEME).toBe(true);
  });

  it('expõe tokens de badges, HUD e mapas para espelho em :root', () => {
    expect(MEDIEVAL_THEME.badgeUpgradeFill).toBe('#7ee787');
    expect(MEDIEVAL_THEME.hpFillStart).toBe('#2d7a3e');
    expect(MEDIEVAL_THEME.scrollbarThumb).toBe('#c9892f');
    expect(MEDIEVAL_THEME.mapStendra).toBe('#6ecf8a');
    expect(MEDIEVAL_THEME.floatHeal).toBe('#2dffb0');
  });
});
