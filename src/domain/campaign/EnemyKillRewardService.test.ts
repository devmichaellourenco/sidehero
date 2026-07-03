import { describe, expect, it, vi } from 'vitest';
import { buildPhaseId } from './CampaignIds';
import { EncounterResolver } from './EncounterResolver';
import { EnemyKillRewardService } from './EnemyKillRewardService';
import { CombatState } from '../entities/CombatState';
import { Enemy } from '../entities/Enemy';
import { GameState } from '../entities/GameState';
import { Stats } from '../value-objects/Stats';
import { ActionTimerService } from '../services/combat/ActionTimerService';

describe('EnemyKillRewardService', () => {
  const service = new EnemyKillRewardService();
  const resolver = new EncounterResolver();

  function combatWithEnemies(state: GameState, phaseId: string, waveIndex: number): CombatState {
    const resolved = resolver.resolve(phaseId, waveIndex)!;
    return CombatState.start(
      state.activeHeroes(),
      resolved.enemies,
      new ActionTimerService(),
      resolved.meta,
    );
  }

  function defeatEnemy(enemies: Enemy[], targetId: string): Enemy[] {
    return enemies.map((entry) =>
      entry.id === targetId
        ? Enemy.restore({
            ...entry.toProps(),
            stats: Stats.create({ ...entry.stats.toProps(), currentHealth: 0 }),
          })
        : entry,
    );
  }

  it('concede ouro e XP ao matar inimigo', () => {
    const phaseId = buildPhaseId(1, 2);
    const state = GameState.initial().withCampaignProgress(
      GameState.initial().campaignProgress.withSelectedPhase(phaseId),
    );
    const combat = combatWithEnemies(state, phaseId, 0);
    const enemy = combat.enemies[0];
    const defeated = defeatEnemy(combat.enemies, enemy.id);

    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const result = service.applyKillRewards(state, combat, combat.enemies, defeated);

    expect(result.state.gold.amount).toBeGreaterThan(0);
    expect(result.state.activeHeroes()[0].experience.current).toBeGreaterThan(0);
    expect(result.combat.hasRewardedEnemy(enemy.id)).toBe(true);
    vi.restoreAllMocks();
  });

  it('não concede recompensa duplicada', () => {
    const phaseId = buildPhaseId(1, 2);
    const state = GameState.initial().withCampaignProgress(
      GameState.initial().campaignProgress.withSelectedPhase(phaseId),
    );
    const combat = combatWithEnemies(state, phaseId, 0);
    const enemy = combat.enemies[0];
    const defeated = defeatEnemy(combat.enemies, enemy.id);

    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const first = service.applyKillRewards(state, combat, combat.enemies, defeated);
    const second = service.applyKillRewards(first.state, first.combat, combat.enemies, defeated);

    expect(second.state.gold.amount).toBe(first.state.gold.amount);
    vi.restoreAllMocks();
  });

  it('concede 50% ouro e 75% XP em replay', () => {
    const phaseId = buildPhaseId(1, 2);
    const cleared = GameState.initial()
      .campaignProgress.markCleared(phaseId, [buildPhaseId(1, 3)], 2)
      .withSelectedPhase(phaseId);
    const state = GameState.initial().withCampaignProgress(cleared);
    const combat = combatWithEnemies(state, phaseId, 0);
    const enemy = combat.enemies[0];
    const defeated = defeatEnemy(combat.enemies, enemy.id);

    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = service.applyKillRewards(state, combat, combat.enemies, defeated);

    const expectedGold = Math.floor(enemy.goldReward * 0.5);
    const expectedXp = Math.floor(enemy.xpReward * 0.75);
    expect(result.state.gold.amount).toBe(expectedGold);
    expect(result.state.activeHeroes()[0].experience.current).toBe(expectedXp);
    vi.restoreAllMocks();
  });
});
