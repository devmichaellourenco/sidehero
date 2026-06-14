import { describe, expect, it } from 'vitest';
import { buildPhaseId } from './CampaignIds';
import { EncounterResolver } from './EncounterResolver';

describe('EncounterResolver', () => {
  const resolver = new EncounterResolver();

  it('resolve fase 1-2 com boss na última wave sem XP nas intermediárias', () => {
    const trash = resolver.resolve(buildPhaseId(1, 2), 0);
    const boss = resolver.resolve(buildPhaseId(1, 2), 1);

    expect(trash?.meta.isBossWave).toBe(false);
    expect(trash?.enemies.every((enemy) => enemy.xpReward === 0)).toBe(true);
    expect(boss?.meta.isBossWave).toBe(true);
    expect(boss?.enemies.some((enemy) => enemy.xpReward > 0)).toBe(true);
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
});
