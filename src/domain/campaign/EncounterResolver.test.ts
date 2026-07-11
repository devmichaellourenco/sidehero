import { describe, expect, it } from 'vitest';
import { ENEMY_QUICK_PHASE_TEST_HP } from '../combat/EnemyCombatBalance';
import { resolvePhaseEnemyStatMultiplier } from '../balance/PhaseEnemyEase';
import { buildPhaseId } from './CampaignIds';
import { EncounterResolver } from './EncounterResolver';
import { spawnEnemiesForWave } from './WaveEnemyFactory';

describe('EncounterResolver', () => {
  const resolver = new EncounterResolver();

  it('resolve fase 1-2 com XP em todas as waves', () => {
    const trash = resolver.resolve(buildPhaseId(1, 2), 0);
    const boss = resolver.resolve(buildPhaseId(1, 2), 1);

    expect(trash?.meta.isBossWave).toBe(false);
    expect(trash?.enemies.every((enemy) => enemy.xpReward > 0)).toBe(true);
    expect(boss?.meta.isBossWave).toBe(true);
    expect(boss?.enemies.some((enemy) => enemy.xpReward > 0)).toBe(true);
    const bossXp = boss!.enemies.find((enemy) => enemy.role === 'boss')!.xpReward;
    const trashXp = trash!.enemies[0].xpReward;
    expect(bossXp).toBeGreaterThan(trashXp);
  });

  it('gera fase procedural 1-20', () => {
    const resolved = resolver.resolve(buildPhaseId(1, 20), 0);
    expect(resolved?.phase.difficultyTier).toBe(20);
    expect(resolved?.enemies.length).toBeGreaterThan(0);
  });

  it('fase 1-50 tem Saci como boss final do capítulo', () => {
    const finale = resolver.resolve(buildPhaseId(1, 50), 3);

    expect(finale?.meta.isBossWave).toBe(true);
    expect(finale?.enemies[0]?.name).toBe('Saci');
    expect(finale?.enemies[0]?.enemyType).toBe('saci');
  });

  it('reduz vida e dano em 30% nas fases 1-47 a 1-50', () => {
    const eased = resolver.resolve(buildPhaseId(1, 47), 0);
    const phase = eased!.phase;
    const wave = phase.waves[0];
    const [baseline] = spawnEnemiesForWave(wave, {
      phaseId: buildPhaseId(1, 47),
      waveIndex: 0,
      difficultyTier: phase.difficultyTier,
      isBossWave: false,
      statMultiplier: phase.statMultiplier ?? 1,
    });

    expect(eased?.enemies[0]?.stats.attack).toBe(Math.floor(baseline.stats.attack * 0.7));
    if (!ENEMY_QUICK_PHASE_TEST_HP) {
      expect(eased?.enemies[0]?.stats.maxHealth).toBe(Math.floor(baseline.stats.maxHealth * 0.7));
    }
    expect(resolvePhaseEnemyStatMultiplier(buildPhaseId(1, 50), 1.5)).toBeCloseTo(1.05);
  });
});
