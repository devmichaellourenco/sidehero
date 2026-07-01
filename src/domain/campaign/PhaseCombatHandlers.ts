import { CHEST_EVERY_N_WINS } from '../constants/CombatRules';
import { CombatIntermission } from './CombatIntermission';
import { CombatState } from '../entities/CombatState';
import { Enemy } from '../entities/Enemy';
import { GameState } from '../entities/GameState';
import { Hero } from '../entities/Hero';
import { Chest } from '../entities/Chest';
import { ActionTimerService } from '../services/combat/ActionTimerService';
import { ChestType } from '../combat/ChestType';
import { EncounterMeta, EncounterResolver } from './EncounterResolver';
import { CampaignProgress } from './CampaignProgress';
import { PhaseRun } from './PhaseRun';
import { BenchXpPolicy } from '../party/BenchXpPolicy';
import { resolvePhase } from './CampaignCatalog';
import { previousPhaseId } from './CampaignIds';
import { MetaBonusScope } from '../meta/MetaBonusScope';
import {
  grantsPhaseChests,
  isPhaseReplay,
  scalePhaseGold,
  scalePhaseXp,
} from './PhaseLootPolicy';

export interface PhaseCombatResult {
  state: GameState;
  events: string[];
}

export class PhaseCombatHandlers {
  constructor(
    private readonly encounterResolver = new EncounterResolver(),
    private readonly actionTimers = new ActionTimerService(),
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
    const replay = isPhaseReplay(state.campaignProgress, phaseId);
    const baseGold = defeatedEnemies.reduce((sum, enemy) => sum + enemy.goldReward, 0);
    const legacyBonuses = MetaBonusScope.get();
    const totalGold = Math.floor(
      scalePhaseGold(baseGold, state.campaignProgress, phaseId) * legacyBonuses.goldMultiplier,
    );
    const enemyNames = defeatedEnemies.map((enemy) => enemy.name).join(', ');
    const nextRun = phaseRun.advanceWave();
    const phase = resolvePhase(phaseId);
    const nextWave = this.encounterResolver.resolve(nextRun.phaseId, nextRun.waveIndex);
    const variant = nextWave?.meta.isBossWave ? 'boss-approach' : 'wave-clear';

    let nextState = state
      .withGold(totalGold > 0 ? state.gold.add(totalGold) : state.gold)
      .withHeroes(heroes)
      .withPhaseRun(nextRun)
      .withCombat(state.combat?.withAllEnemiesDefeated() ?? null)
      .withCombatIntermission(
        CombatIntermission.create({
          variant,
          clearedPhaseId: phaseId,
          clearedPhaseName: phase?.displayName ?? phaseId,
        }),
      );

    if (totalGold > 0 && replay) {
      nextState = nextState.addLog(
        `${enemyNames} derrotado(s)! +${totalGold} ouro (50%)`,
      );
    } else if (totalGold > 0) {
      nextState = nextState.addLog(`${enemyNames} derrotado(s)! +${totalGold} ouro`);
    } else {
      nextState = nextState.addLog(`${enemyNames} derrotado(s)!`);
    }

    if (grantsPhaseChests(state.campaignProgress, phaseId) && !meta.isBossWave && Math.random() < 0.12) {
      const chest = Chest.create(phase?.difficultyTier ?? state.stage, 'monster');
      nextState = nextState.withChests([...nextState.chests, chest]).addLog('📦 Baú de monstro dropou!');
    }

    const events: string[] = [];
    if (totalGold > 0) {
      events.push(replay ? `+${totalGold} ouro (50%)` : `+${totalGold} ouro`);
    }

    return {
      state: nextState.touchTick(),
      events,
    };
  }

  onBossDefeated(
    state: GameState,
    defeatedEnemies: Enemy[],
    heroes: Hero[],
    meta: EncounterMeta,
  ): PhaseCombatResult {
    const phase = resolvePhase(meta.phaseId);
    if (!phase) {
      return { state, events: [] };
    }

    const replay = isPhaseReplay(state.campaignProgress, meta.phaseId);
    const baseGold = defeatedEnemies.reduce((sum, enemy) => sum + enemy.goldReward, 0);
    const baseXp = defeatedEnemies.reduce((sum, enemy) => sum + enemy.xpReward, 0);
    const combatMeta = MetaBonusScope.get();
    const totalGold = Math.floor(
      scalePhaseGold(baseGold, state.campaignProgress, meta.phaseId) * combatMeta.goldMultiplier,
    );
    const totalXp = Math.floor(
      scalePhaseXp(baseXp, state.campaignProgress, meta.phaseId) * combatMeta.xpMultiplier,
    );

    let progress = state.campaignProgress.markCleared(
      meta.phaseId,
      phase.unlocks,
      phase.difficultyTier,
    );

    if (phase.seasonFinale) {
      progress = progress.markSeasonCompleted();
    } else if (phase.unlocks.length > 0) {
      progress = progress.withSelectedPhase(phase.unlocks[0]);
    }

    const recoveredHeroes = heroes
      .map((hero) => hero.gainExperience(totalXp))
      .map((hero) => hero.healFull());

    const benchXp = BenchXpPolicy.benchExperience(totalXp);
    const benchUpdates =
      benchXp > 0
        ? state.benchHeroes().map((hero) => hero.gainExperience(benchXp))
        : [];

    const benchLog =
      benchXp > 0 && benchUpdates.length > 0 ? ` · Reserva +${benchXp} XP` : '';

    const nextPhaseId = phase.seasonFinale ? null : progress.selectedPhaseId;
    const nextPhase = nextPhaseId ? resolvePhase(nextPhaseId) : null;
    const nextPhaseName =
      nextPhaseId && nextPhaseId !== meta.phaseId
        ? (nextPhase?.displayName ?? nextPhaseId)
        : null;

    let nextState = state
      .withCampaignProgress(progress)
      .withGold(totalGold > 0 ? state.gold.add(totalGold) : state.gold)
      .withRosterHeroes([...recoveredHeroes, ...benchUpdates])
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

    const rewardSuffix = replay ? ' (repetição — 50% ouro, 75% XP)' : '';

    if (phase.seasonFinale) {
      nextState = nextState.addLog(
        replay
          ? `🏆 Boss final derrotado em ${phase.displayName}${rewardSuffix}! +${totalGold} ouro, +${totalXp} XP · Party recuperada${benchLog}`
          : `🏆 Temporada concluída! Boss final derrotado em ${phase.displayName}! +${totalGold} ouro, +${totalXp} XP · Party recuperada`,
      );
    } else {
      nextState = nextState.addLog(
        `Boss derrotado em ${phase.displayName}${rewardSuffix}! +${totalGold} ouro, +${totalXp} XP · Party recuperada${benchLog}`,
      );
    }

    const events = replay
      ? [`${phase.displayName} repetida!`, `+${totalGold} ouro`, `+${totalXp} XP`]
      : phase.seasonFinale
        ? ['🏆 Temporada concluída!', `${phase.displayName} finalizada!`, `+${totalGold} ouro`, `+${totalXp} XP`]
        : [`${phase.displayName} concluída!`, `+${totalGold} ouro`, `+${totalXp} XP`];

    if (grantsPhaseChests(state.campaignProgress, meta.phaseId) && nextState.totalBattlesWon % CHEST_EVERY_N_WINS === 0) {
      const chestType: ChestType = phase.seasonFinale ? 'act_boss' : 'boss';
      const chest = Chest.create(phase.difficultyTier, chestType);
      nextState = nextState.withChests([...nextState.chests, chest]).addLog('📦 Baú dropou no painel!');
      events.push('Baú obtido!');
    }

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

    const cleared = state.withCombatIntermission(null);

    if (cleared.phaseRun) {
      return this.startCombatForPhaseRun(cleared, cleared.phaseRun);
    }

    const phaseId = cleared.campaignProgress.selectedPhaseId;
    if (!phaseId) {
      return { state: cleared, events: [] };
    }

    return this.startPhaseRun(cleared, PhaseRun.start(phaseId));
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
