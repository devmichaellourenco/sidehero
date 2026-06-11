import { describe, expect, it } from 'vitest';
import {
  mitigatePhysicalDamage,
  resolveOutgoingDamage,
  rollCriticalMultiplier,
} from './CombatDamageResolver';

describe('CombatDamageResolver', () => {
  it('aplica redução de armadura com diminishing returns', () => {
    const mitigated = mitigatePhysicalDamage(20, 45, 1);
    expect(mitigated).toBeGreaterThan(1);
    expect(mitigated).toBeLessThan(20);
  });

  it('garante dano mínimo de 1', () => {
    const mitigated = mitigatePhysicalDamage(5, 500, 50);
    expect(mitigated).toBeGreaterThanOrEqual(1);
    expect(mitigated).toBeLessThan(5);
  });

  it('aplica crítico quando rng está abaixo da chance', () => {
    const result = rollCriticalMultiplier(0.5, 1.8, { rng: () => 0.1 });
    expect(result.isCrit).toBe(true);
    expect(result.multiplier).toBe(1.8);
  });

  it('resolve dano final com perfil de atacante', () => {
    const result = resolveOutgoingDamage(
      20,
      8,
      5,
      { attackSpeed: 1, castSpeed: 1, critChance: 1, critDamage: 1.5 },
      { rng: () => 0 },
    );

    expect(result.isCrit).toBe(true);
    expect(result.amount).toBeGreaterThan(1);
  });
});
