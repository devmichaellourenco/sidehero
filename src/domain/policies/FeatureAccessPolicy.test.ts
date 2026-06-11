import { describe, expect, it } from 'vitest';
import { FeatureAccessPolicy } from './FeatureAccessPolicy';

describe('FeatureAccessPolicy', () => {
  it('resolve auto-batalha ligada por padrão sem upgrades', () => {
    const flags = FeatureAccessPolicy.resolve({});
    expect(flags.autoBattle).toBe(true);
    expect(flags.autoBattleMaxSpeed).toBe(1);
    expect(flags.optimizeLoadout).toBe(false);
    expect(flags.backgroundTickMultiplier).toBe(1);
  });

  it('resolve auto-batalha velocidade 3 no nível 3', () => {
    const flags = FeatureAccessPolicy.resolve({ auto_battle: 3 });
    expect(flags.autoBattle).toBe(true);
    expect(flags.autoBattleMaxSpeed).toBe(3);
  });

  it('resolve abrir todos automático no nível 2', () => {
    const flags = FeatureAccessPolicy.resolve({ open_all_chests: 2 });
    expect(flags.openAllChests).toBe(true);
    expect(flags.autoOpenAllChests).toBe(true);
  });
});
