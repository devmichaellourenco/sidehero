import { describe, expect, it } from 'vitest';
import { resolveBattleFloatClass } from './BattleFloatingTextPresentation';

describe('resolveBattleFloatClass', () => {
  it('prioriza classe de crítico', () => {
    expect(resolveBattleFloatClass({ kind: 'crit', damageElement: 'fire' })).toBe('crit');
  });

  it('usa elemento dominante em dano normal', () => {
    expect(resolveBattleFloatClass({ kind: 'damage', damageElement: 'chaos' })).toBe('damage-chaos');
    expect(resolveBattleFloatClass({ kind: 'damage' })).toBe('damage');
  });
});
