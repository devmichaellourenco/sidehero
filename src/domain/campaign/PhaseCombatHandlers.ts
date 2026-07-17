import { CombatIntermission } from './CombatIntermission';
import { CombatState } from '../entities/CombatState';
import { Enemy } from '../entities/Enemy';
import { GameState } from '../entities/GameState';
import { Hero } from '../entities/Hero';
import { LootService } from '../services/LootService';
import { ActionTimerService } from '../services/combat/ActionTimerService';
import { tryGrantMilestoneUniqueGearOnPhaseClear } from './UniqueGearLootService';
import { EncounterMeta, EncounterResolver } from './EncounterResolver';
import { PhaseRun } from './PhaseRun';
import { resolvePhase } from './CampaignCatalog';
import { isMilestonePhase, parsePhaseId, previousPhaseId, PhaseId } from './CampaignIds';

export interface PhaseCombatResult {
  state: GameState;
  events: string[];
}

export class PhaseCombatHandlers {
  constructor(
    private readonly encounterResolver = new EncounterResolver(),
    private readonly actionTimers = new ActionTimerService(),
    private readonly lootService = new LootService(),
  ) {}

  startPhaseRun(state: GameState, phaseRun: PhaseRun): PhaseCombatResult {
    const resolved = this.encounterResolver.resolve(phaseRun.phaseId, phaseRun.waveIndex);
    if (!resolved) {
      return { state, events: [] };
    }

    const combat = CombatState.start(
      state.activeHeroes(),
      resolved.enemies,
      this.actionTimers,
      resolved.meta,
    );
    const phase = resolved.phase;
    const waveLabel = `${phaseRun.waveIndex + 1}/${resolved.meta.waveCount}`;

    return {
      state: state.withPhaseRun(phaseRun).withCombat(combat),
      events: [`Iniciou ${phase.displayName} · Wave ${waveLabel}`],
    };
  }

  onWaveCleared(
    state: GameState,
    defeatedEnemies: Enemy[],
    heroes: Hero[],
    meta: EncounterMeta,
    phaseRun: PhaseRun,
  ): PhaseCombatResult {
    const phaseId = meta.phaseId;
    const enemyNames = defeatedEnemies.map((enemy) => enemy.name).join(', ');
    const nextRun = phaseRun.advanceWave();
    const phase = resolvePhase(phaseId);
    const nextWave = this.encounterResolver.resolve(nextRun.phaseId, nextRun.waveIndex);
    const variant = nextWave?.meta.isBossWave ? 'boss-approach' : 'wave-clear';

    const nextState = state
      .withHeroes(heroes)
      .withPhaseRun(nextRun)
      .withCombat(state.combat?.withAllEnemiesDefeated() ?? null)
      .withCombatIntermission(
        CombatIntermission.create({
          variant,
          clearedPhaseId: phaseId,
          clearedPhaseName: phase?.displayName ?? phaseId,
        }),
      )
      .addLog(`Wave limpa! ${enemyNames}`)
      .touchTick();

    return {
      state: nextState,
      events: ['Wave limpa!'],
    };
  }

  onBossDefeated(
    state: GameState,
    _defeatedEnemies: Enemy[],
    heroes: Hero[],
    meta: EncounterMeta,
  ): PhaseCombatResult {
    const phase = resolvePhase(meta.phaseId);
    if (!phase) {
      return { state, events: [] };
    }

    const replay = state.campaignProgress.isCleared(meta.phaseId);

    let progress = state.campaignProgress.markCleared(
      meta.phaseId,
      phase.unlocks,
      phase.difficultyTier,
    );

    if (phase.seasonFinale) {
      progress = progress.markSeasonCompleted().withSelectedPhase(meta.phaseId);
    } else if (phase.unlocks.length > 0) {
      progress = progress.withSelectedPhase(phase.unlocks[0]);
    }

    const recoveredHeroes = heroes.map((hero) => hero.healFull());

    const nextPhaseId = phase.seasonFinale ? null : progress.selectedPhaseId;
    const nextPhase = nextPhaseId ? resolvePhase(nextPhaseId) : null;
    const nextPhaseName =
      nextPhaseId && nextPhaseId !== meta.phaseId
        ? (nextPhase?.displayName ?? nextPhaseId)
        : null;

    let nextState = state
      .withCampaignProgress(progress)
      .withRosterHeroes(recoveredHeroes)
      .withStage(progress.highestTierReached)
      .withPhaseRun(null)
      .withCombat(null)
      .withCombatIntermission(
        CombatIntermission.create({
          variant: 'phase-clear',
          clearedPhaseId: meta.phaseId,
          clearedPhaseName: phase.displayName,
          nextPhaseId: phase.seasonFinale ? null : nextPhaseId,
          nextPhaseName: phase.seasonFinale ? null : nextPhaseName,
        }),
      )
      .incrementBattlesWon();

    const milestoneGear = tryGrantMilestoneUniqueGearOnPhaseClear(
      nextState,
      meta.phaseId,
      this.lootService,
    );
    if (milestoneGear) {
      nextState = nextState.withInventory([...nextState.inventory, milestoneGear]);
    }

    if (phase.seasonFinale) {
      nextState = nextState.addLog(
        replay
          ? `🏆 Boss final derrotado em ${phase.displayName}! · Party recuperada`
          : `🏆 Temporada concluída! Boss final derrotado em ${phase.displayName}! · Party recuperada`,
      );
    } else {
      nextState = nextState.addLog(
        `Boss derrotado em ${phase.displayName}! · Party recuperada`,
      );
    }

    const events = replay
      ? [`${phase.displayName} repetida!`]
      : phase.seasonFinale
        ? ['🏆 Temporada concluída!', `${phase.displayName} finalizada!`]
        : [`${phase.displayName} concluída!`];

    return { state: nextState.touchTick(), events };
  }

  startSelectedPhaseFromPause(state: GameState): PhaseCombatResult {
    const phaseId = state.campaignProgress.selectedPhaseId;
    if (!phaseId) {
      return { state, events: [] };
    }

    const recovered = state.activeHeroes().map((hero) => hero.healFull());
    return this.startPhaseRun(state.withHeroes(recovered), PhaseRun.start(phaseId));
  }

  restartPhaseFromPause(state: GameState, phaseRun: PhaseRun): PhaseCombatResult {
    const recovered = state.activeHeroes().map((hero) => hero.healFull());
    const resetRun = phaseRun.resetWaves();
    const resolved = this.encounterResolver.resolve(resetRun.phaseId, resetRun.waveIndex);
    if (!resolved) {
      return {
        state: state.withHeroes(recovered).withPhaseRun(null).withCombat(null),
        events: [],
      };
    }

    const combat = CombatState.start(recovered, resolved.enemies, this.actionTimers, resolved.meta);
    const phase = resolved.phase;
    const waveLabel = `${resetRun.waveIndex + 1}/${resolved.meta.waveCount}`;

    return {
      state: state
        .withHeroes(recovered)
        .withPhaseRun(resetRun)
        .withCombat(combat)
        .addLog(`⏯ Fase reiniciada em ${phase.displayName} · Wave ${waveLabel}`),
      events: [`Fase reiniciada · Wave ${waveLabel}`],
    };
  }

  onPhaseWipe(state: GameState, phaseRun: PhaseRun): PhaseCombatResult {
    const recovered = state.activeHeroes().map((hero) => hero.healFull());
    const failedPhase = resolvePhase(phaseRun.phaseId);
    const restartPhaseId = previousPhaseId(phaseRun.phaseId);
    const resetRun = PhaseRun.start(restartPhaseId);
    const restartPhase = resolvePhase(restartPhaseId);
    const failedName = failedPhase?.displayName ?? phaseRun.phaseId;

    return {
      state: state
        .withHeroes(recovered)
        .withCampaignProgress(state.campaignProgress.withSelectedPhase(restartPhaseId))
        .withPhaseRun(resetRun)
        .withCombat(null)
        .withCombatIntermission(
          CombatIntermission.create({
            variant: 'defeat',
            clearedPhaseId: phaseRun.phaseId,
            clearedPhaseName: failedName,
          }),
        )
        .addLog(
          `Party derrotada em ${failedName}! Reiniciando na fase anterior (${restartPhase?.displayName ?? restartPhaseId})...`,
        ),
      events: ['Party derrotada! Reiniciando na fase anterior...'],
    };
  }

  resumeIntermission(state: GameState): PhaseCombatResult {
    if (!state.combatIntermission) {
      return { state, events: [] };
    }

    const intermission = state.combatIntermission;
    const cleared = state.withCombatIntermission(null);

    if (this.shouldEnterCampAfterPhaseClear(intermission)) {
      return this.enterCampForNextPhase(cleared, intermission);
    }

    if (cleared.phaseRun) {
      return this.startCombatForPhaseRun(cleared, cleared.phaseRun);
    }

    const phaseId = cleared.campaignProgress.selectedPhaseId;
    if (!phaseId) {
      return { state: cleared, events: [] };
    }

    return this.startPhaseRun(cleared, PhaseRun.start(phaseId));
  }

  private shouldEnterCampAfterPhaseClear(intermission: CombatIntermission): boolean {
    if (intermission.variant !== 'phase-clear') return false;

    const phase = resolvePhase(intermission.clearedPhaseId);
    if (!phase) return false;

    const { phaseNumber } = parsePhaseId(intermission.clearedPhaseId);
    return phase.seasonFinale === true || isMilestonePhase(phaseNumber);
  }

  private enterCampForNextPhase(
    state: GameState,
    intermission: CombatIntermission,
  ): PhaseCombatResult {
    const targetPhaseId =
      (intermission.nextPhaseId as PhaseId | null) ?? state.campaignProgress.selectedPhaseId;
    const phaseRun = PhaseRun.start(targetPhaseId);
    const nextPhase = resolvePhase(targetPhaseId);

    return {
      state: state
        .withCampaignProgress(state.campaignProgress.withSelectedPhase(targetPhaseId))
        .withPhaseRun(phaseRun)
        .withCombat(null)
        .withLoadoutEditOpen(true)
        .withPhaseRestartOnResume(true)
        .addLog(
          `🏕 Acampamento — ${nextPhase?.displayName ?? targetPhaseId}. Toque em Batalhar para continuar`,
        ),
      events: ['Acampamento'],
    };
  }

  private startCombatForPhaseRun(state: GameState, phaseRun: PhaseRun): PhaseCombatResult {
    const resolved = this.encounterResolver.resolve(phaseRun.phaseId, phaseRun.waveIndex);
    if (!resolved) {
      return {
        state: state.withPhaseRun(null).withCombat(null),
        events: [],
      };
    }

    const combat = CombatState.start(
      state.activeHeroes(),
      resolved.enemies,
      this.actionTimers,
      resolved.meta,
    );
    const waveLabel = `${phaseRun.waveIndex + 1}/${resolved.meta.waveCount}`;

    return {
      state: state.withPhaseRun(phaseRun).withCombat(combat).touchTick(),
      events: [`Wave ${waveLabel} iniciada`],
    };
  }
}
