import { describe, expect, it } from 'vitest';
import { GameState } from '../../entities/GameState';
import { PhaseRun } from '../PhaseRun';
import { mainMissionId, normalMissionId, sideMissionId } from './MissionId';
import {
  applyMissionDefeat,
  applyMissionVictory,
  enterCampHub,
  startMissionOnState,
} from './ResolveMissionOutcome';
import { MissionProgress } from './MissionProgress';

describe('ResolveMissionOutcome', () => {
  it('vitória main marca concluída e prepara retorno ao camp sem próxima fase', () => {
    const phaseId = '1-1';
    const state = GameState.initial().withCampaignProgress(
      GameState.initial().campaignProgress.withMissionProgress(
        MissionProgress.initial().withActiveMission(mainMissionId(phaseId)),
      ),
    );

    const result = applyMissionVictory({
      state,
      phaseId,
      heroes: state.heroes,
      phaseDisplayName: 'Fase 1-1',
    });

    expect(result.missionId).toBe(mainMissionId(phaseId));
    expect(result.state.campaignProgress.missionProgress.isMainCompleted(mainMissionId(phaseId))).toBe(
      true,
    );
    expect(result.state.campaignProgress.missionProgress.activeMissionId).toBeNull();
    expect(result.state.combatIntermission?.variant).toBe('phase-clear');
    expect(result.state.combatIntermission?.nextPhaseId).toBeNull();
    expect(result.state.phaseRun).toBeNull();
  });

  it('vitória normal remove da oferta sem marcar main', () => {
    const phaseId = '1-2';
    const missionId = normalMissionId(phaseId);
    const progress = MissionProgress.initial()
      .withNormalOffer('stendra', [missionId, normalMissionId('1-3')], 0)
      .withActiveMission(missionId);
    const state = GameState.initial().withCampaignProgress(
      GameState.initial().campaignProgress.withMissionProgress(progress),
    );

    const result = applyMissionVictory({
      state,
      phaseId,
      heroes: state.heroes,
      phaseDisplayName: 'Fase 1-2',
    });

    expect(result.state.campaignProgress.missionProgress.normalOfferFor('stendra')).not.toContain(
      missionId,
    );
    expect(result.state.campaignProgress.missionProgress.completedMainIds).toHaveLength(0);
  });

  it('derrota normal remove da oferta; main permanece incompleta', () => {
    const phaseId = '1-2';
    const missionId = normalMissionId(phaseId);
    const progress = MissionProgress.initial()
      .withNormalOffer('stendra', [missionId], 0)
      .withActiveMission(missionId);
    const state = GameState.initial()
      .withPhaseRun(PhaseRun.start(phaseId))
      .withCampaignProgress(GameState.initial().campaignProgress.withMissionProgress(progress));

    const defeat = applyMissionDefeat({
      state,
      phaseId,
      phaseDisplayName: 'Fase 1-2',
    });

    expect(defeat.state.campaignProgress.missionProgress.normalOfferFor('stendra')).not.toContain(
      missionId,
    );
    expect(defeat.state.combatIntermission?.variant).toBe('defeat');

    const mainDefeat = applyMissionDefeat({
      state: GameState.initial().withCampaignProgress(
        GameState.initial().campaignProgress.withMissionProgress(
          MissionProgress.initial().withActiveMission(mainMissionId('1-1')),
        ),
      ),
      phaseId: '1-1',
      phaseDisplayName: 'Fase 1-1',
    });

    expect(
      mainDefeat.state.campaignProgress.missionProgress.isMainCompleted(mainMissionId('1-1')),
    ).toBe(false);
    expect(mainDefeat.state.campaignProgress.missionProgress.activeMissionId).toBeNull();
  });

  it('enterCampHub bloqueia combate e conta visita (refresh a cada 2)', () => {
    const progress = MissionProgress.initial().withNormalOffer(
      'stendra',
      [normalMissionId('1-2')],
      0,
    );
    const state = GameState.initial().withCampaignProgress(
      GameState.initial().campaignProgress.withMissionProgress(progress),
    );

    const camp = enterCampHub(state, 'camp');

    expect(camp.loadoutEditOpen).toBe(true);
    expect(camp.phaseRestartOnResume).toBe(true);
    expect(camp.phaseRun).toBeNull();
    expect(camp.combat).toBeNull();
    expect(camp.campaignProgress.missionProgress.campVisitsSinceNormalRefresh).toBe(1);
    expect(camp.campaignProgress.missionProgress.offerEpochFor('stendra')).toBe(0);

    const camp2 = enterCampHub(camp, 'camp2');
    expect(camp2.campaignProgress.missionProgress.offerEpochFor('stendra')).toBe(1);
  });

  it('vitória side marca concluída e aplica ouro/XP declarados', () => {
    const ashId = sideMissionId('stendra_ash_trail');
    const ashState = GameState.initial().withCampaignProgress(
      GameState.initial().campaignProgress.withMissionProgress(
        MissionProgress.initial()
          .markMainCompleted(mainMissionId('1-5'))
          .withActiveMission(ashId),
      ),
    );
    const goldBefore = ashState.gold.value();
    const result = applyMissionVictory({
      state: ashState,
      phaseId: '1-6',
      heroes: ashState.heroes,
      phaseDisplayName: 'Trilha',
    });
    expect(result.state.campaignProgress.missionProgress.isSideCompleted(ashId)).toBe(true);
    expect(result.state.gold.value()).toBeGreaterThan(goldBefore);
    expect(result.state.campaignProgress.missionProgress.pendingNarrativeSceneIds).toContain(
      'side:stendra_ash_trail',
    );
  });

  it('vitória side concede item exclusivo uma vez', () => {
    const cacheId = sideMissionId('stendra_hidden_cache');
    const state = GameState.initial().withCampaignProgress(
      GameState.initial().campaignProgress.withMissionProgress(
        MissionProgress.initial()
          .markMainCompleted(mainMissionId('1-5'))
          .markSideCompleted(sideMissionId('stendra_ash_trail'))
          .withActiveMission(cacheId),
      ),
    );

    const first = applyMissionVictory({
      state,
      phaseId: '1-8',
      heroes: state.heroes,
      phaseDisplayName: 'Cache',
    });

    expect(
      first.state.campaignProgress.missionProgress.awardedExclusiveItemIds,
    ).toContain('side_stendra_cache_charm');
    expect(
      first.state.inventory.some((gear) => gear.catalogItemId === 'side_stendra_cache_charm') ||
        first.state.stash.some((gear) => gear.catalogItemId === 'side_stendra_cache_charm'),
    ).toBe(true);

    const second = applyMissionVictory({
      state: first.state.withCampaignProgress(
        first.state.campaignProgress.withMissionProgress(
          first.state.campaignProgress.missionProgress.withActiveMission(cacheId),
        ),
      ),
      phaseId: '1-8',
      heroes: first.state.heroes,
      phaseDisplayName: 'Cache',
    });
    const charmCount = [...second.state.inventory, ...second.state.stash].filter(
      (gear) => gear.catalogItemId === 'side_stendra_cache_charm',
    ).length;
    expect(charmCount).toBe(1);
  });

  it('startMissionOnState rejeita side ainda bloqueada', () => {
    const result = startMissionOnState({
      state: GameState.initial(),
      missionId: sideMissionId('stendra_ash_trail'),
    });

    expect(result.error).toMatch(/indisponível/i);
  });

  it('startMissionOnState aceita próxima main e mantém camp', () => {
    const result = startMissionOnState({
      state: GameState.initial(),
      missionId: mainMissionId('1-1'),
    });

    expect(result.error).toBeUndefined();
    expect(result.state.campaignProgress.selectedPhaseId).toBe('1-1');
    expect(result.state.campaignProgress.missionProgress.activeMissionId).toBe(
      mainMissionId('1-1'),
    );
    expect(result.state.loadoutEditOpen).toBe(true);
    expect(result.state.phaseRestartOnResume).toBe(true);
  });
});
