import { describe, expect, it } from 'vitest';
import { buildPhaseId } from '../../domain/campaign/CampaignIds';
import { migrateEnemy } from './GameStateMigration';
import { IGNUS_IX_TEMPLATE_ID } from '../../domain/gear/UniqueGearCatalog';

describe('migrateEnemy', () => {
  it('preserva role de boss ao recarregar combate do storage', () => {
    const migrated = migrateEnemy({
      id: 'boss-1',
      name: 'Saci',
      enemyType: 'saci',
      stage: 50,
      role: 'boss',
      stats: {
        attack: 20,
        defense: 8,
        maxHealth: 1,
        currentHealth: 1,
      },
      goldReward: 100,
      xpReward: 50,
    });

    expect(migrated?.role).toBe('boss');
    expect(migrated?.enemyType).toBe('saci');
  });
});

describe('PhaseCombatHandlers — lendários de marco', () => {
  it('concede Ignus Ix ao concluir fase 1-50', async () => {
    const { PhaseCombatHandlers } = await import('../../domain/campaign/PhaseCombatHandlers');
    const { EncounterResolver } = await import('../../domain/campaign/EncounterResolver');
    const { GameState } = await import('../../domain/entities/GameState');
    const { PhaseRun } = await import('../../domain/campaign/PhaseRun');

    const handlers = new PhaseCombatHandlers();
    const resolver = new EncounterResolver();
    const phaseId = buildPhaseId(1, 50);
    const phaseRun = PhaseRun.start(phaseId);
    let state = GameState.initial()
      .withCampaignProgress(GameState.initial().campaignProgress.withSelectedPhase(phaseId))
      .withPhaseRun(phaseRun);
    state = handlers.startPhaseRun(state, phaseRun).state;

    const bossWave = resolver.resolve(phaseId, 3);
    const victory = handlers.onBossDefeated(state, bossWave!.enemies, state.heroes, bossWave!.meta);

    expect(victory.state.inventory.some((gear) => gear.templateId === IGNUS_IX_TEMPLATE_ID)).toBe(
      true,
    );
  });
});
