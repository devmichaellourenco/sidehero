import { describe, expect, it } from 'vitest';
import { resolveMultiComponentDamage } from './MitigationPipeline';

describe('MitigationPipeline', () => {
  it('reduz dano elemental por resistência linear', () => {
    const amount = resolveMultiComponentDamage(
      100,
      [{ element: 'fire', delivery: 'projectile', weight: 1 }],
      {
        armor: 0,
        stageLevel: 1,
        resistances: { fire: 25, cold: 0, lightning: 0, chaos: 0, allElemental: 0 },
      },
    );

    expect(amount).toBe(75);
  });

  it('aplica armadura só ao componente físico', () => {
    const amount = resolveMultiComponentDamage(
      100,
      [
        { element: 'fire', delivery: 'aoe', weight: 0.5 },
        { element: 'physical', delivery: 'melee', weight: 0.5 },
      ],
      {
        armor: 40,
        stageLevel: 1,
        resistances: { fire: 0, cold: 0, lightning: 0, chaos: 0, allElemental: 0 },
      },
    );

    expect(amount).toBeGreaterThan(1);
    expect(amount).toBeLessThan(100);
  });
});
