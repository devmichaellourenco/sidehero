import { describe, expect, it } from 'vitest';
import { mapCombatStatusEffectIconPath } from './CombatStatusEffectIconMapper';

describe('mapCombatStatusEffectIconPath', () => {
  it('mapeia buff e debuff para paths de assets', () => {
    expect(mapCombatStatusEffectIconPath('buff_attack')).toBe('ui/defense.png');
    expect(mapCombatStatusEffectIconPath('debuff_defense')).toBe('ui/defense.png');
  });
});
