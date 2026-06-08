import { describe, expect, it } from 'vitest';
import { CombatStatusEffectTracker } from './CombatStatusEffectTracker';
import {
  mitigateDamage,
  resolveEffectiveAttack,
  resolveEffectiveDefense,
} from './CombatStatResolver';

describe('CombatStatResolver', () => {
  it('reduz dano recebido com debuff de defesa', () => {
    const tracker = CombatStatusEffectTracker.fromMap({}).apply({
      combatantKey: 'hero:h1',
      skillId: 'wraith_curse',
      kind: 'debuff_defense',
      magnitude: 3,
      durationTurns: 2,
    });

    expect(resolveEffectiveDefense(10, 'hero:h1', tracker)).toBe(7);
    expect(mitigateDamage(12, 7)).toBe(5);
  });

  it('aumenta ataque efetivo com buff', () => {
    const tracker = CombatStatusEffectTracker.fromMap({}).apply({
      combatantKey: 'hero:h1',
      skillId: 'blessing',
      kind: 'buff_attack',
      magnitude: 4,
      durationTurns: 3,
    });

    expect(resolveEffectiveAttack(11, 'hero:h1', tracker)).toBe(15);
  });
});
