import { describe, expect, it } from 'vitest';
import { formatCombatResistTooltipLine, mapCombatResistSummary } from './CombatResistMapper';

describe('CombatResistMapper', () => {
  it('agrega all-elemental nas resistências efetivas', () => {
    const summary = mapCombatResistSummary({
      fire: 10,
      cold: 0,
      lightning: 0,
      chaos: 0,
      allElemental: 5,
    });

    expect(summary.fire).toBe(15);
    expect(summary.cold).toBe(5);
  });

  it('formata linha compacta para tooltip', () => {
    const line = formatCombatResistTooltipLine({
      fire: 12,
      cold: 0,
      lightning: 8,
      chaos: 0,
    });

    expect(line).toBe('Resist: Fogo 12% · Raio 8%');
  });

  it('retorna null quando não há resistências', () => {
    expect(
      formatCombatResistTooltipLine({
        fire: 0,
        cold: 0,
        lightning: 0,
        chaos: 0,
      }),
    ).toBeNull();
  });
});
