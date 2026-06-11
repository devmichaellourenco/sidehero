import { EnemyType } from '../entities/EnemyType';
import { CombatProfile, createCombatProfile } from './CombatProfile';

const BASELINES: Record<EnemyType, CombatProfile> = {
  slime: createCombatProfile({ attackSpeed: 0.6, critChance: 0 }),
  goblin: createCombatProfile({ attackSpeed: 1.0, critChance: 0.01, critDamage: 1.3 }),
  orc: createCombatProfile({ attackSpeed: 0.8, critChance: 0.015, critDamage: 1.35 }),
  wraith: createCombatProfile({ attackSpeed: 0.85, critChance: 0.02, critDamage: 1.4 }),
  dragon: createCombatProfile({ attackSpeed: 0.5, critChance: 0.03, critDamage: 1.5 }),
};

export function getEnemyCombatBaseline(enemyType: EnemyType, isBoss = false): CombatProfile {
  const base = { ...BASELINES[enemyType] };
  if (!isBoss) return base;

  return {
    ...base,
    attackSpeed: base.attackSpeed * 0.85,
    critChance: Math.min(0.08, base.critChance + 0.02),
    critDamage: base.critDamage + 0.1,
  };
}
