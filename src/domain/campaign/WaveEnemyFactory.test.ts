import { describe, expect, it } from 'vitest';
import { ENEMY_HP_BALANCE_FACTOR, resolveEnemySpawnMaxHealth } from '../combat/EnemyCombatBalance';
import { stageScalingFactorsForTier } from '../progression/StageScalingCatalog';
import { spawnEnemiesForWave } from './WaveEnemyFactory';

describe('stageScalingFactorsForTier', () => {
  it('cresce de forma agressiva em tiers altos', () => {
    const early = stageScalingFactorsForTier(5);
    const mid = stageScalingFactorsForTier(50);
    const late = stageScalingFactorsForTier(200);
    const finale = stageScalingFactorsForTier(500, 1.85);

    expect(mid.atk).toBeGreaterThan(early.atk * 3);
    expect(late.hp).toBeGreaterThan(mid.hp * 3);
    expect(finale.atk).toBeGreaterThan(late.atk * 1.5);
  });
});

describe('spawnEnemiesForWave', () => {
  it('aplica fator de HP de balanceamento nos inimigos da campanha', () => {
    const [enemy] = spawnEnemiesForWave(
      { slots: [{ enemyType: 'goblin_raider', role: 'trash', count: 1 }] },
      {
        phaseId: '1-1',
        waveIndex: 0,
        difficultyTier: 1,
        isBossWave: false,
      },
    );

    expect(enemy.stats.maxHealth).toBe(
      resolveEnemySpawnMaxHealth(Math.floor(60 * ENEMY_HP_BALANCE_FACTOR)),
    );
  });
});
