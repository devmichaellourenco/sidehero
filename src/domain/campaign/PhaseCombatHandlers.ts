import { CHEST_EVERY_N_WINS } from '../constants/CombatRules';
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
    const totalGold = scalePhaseGold(baseGold, state.campaignProgress, phaseId);
    const enemyNames = defeatedEnemies.map((enemy) => enemy.name).join(', ');
    const nextRun = phaseRun.advanceWave();
    const resolved = this.encounterResolver.resolve(nextRun.phaseId, nextRun.waveIndex);

    if (!resolved) {
      return { state: state.withHeroes(heroes), events: [] };
    }

    const combat = CombatState.start(heroes, resolved.enemies, this.actionTimers, resolved.meta);
    const waveLabel = `${nextRun.waveIndex + 1}/${resolved.meta.waveCount}`;

    let nextState = state
      .withGold(totalGold > 0 ? state.gold.add(totalGold) : state.gold)
      .withHeroes(heroes)
      .withPhaseRun(nextRun)
      .withCombat(combat);

    if (totalGold > 0 && replay) {
      nextState = nextState.addLog(
        `${enemyNames} derrotado(s)! +${totalGold} ouro (50%) · Wave ${waveLabel}`,
      );
    } else if (totalGold > 0) {
      nextState = nextState.addLog(`${enemyNames} derrotado(s)! +${totalGold} ouro · Wave ${waveLabel}`);
    } else {
      nextState = nextState.addLog(`${enemyNames} derrotado(s)! · Wave ${waveLabel}`);
    }

    if (grantsPhaseChests(state.campaignProgress, phaseId) && !meta.isBossWave && Math.random() < 0.12) {
      const chest = Chest.create(resolved.phase.difficultyTier, 'monster');
      nextState = nextState.withChests([...nextState.chests, chest]).addLog('📦 Baú de monstro dropou!');
    }

    const events = [`Wave ${waveLabel} iniciada`];
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
    const totalGold = scalePhaseGold(baseGold, state.campaignProgress, meta.phaseId);
    const totalXp = scalePhaseXp(baseXp, state.campaignProgress, meta.phaseId);

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

    let nextState = state
      .withCampaignProgress(progress)
      .withGold(totalGold > 0 ? state.gold.add(totalGold) : state.gold)
      .withRosterHeroes([...recoveredHeroes, ...benchUpdates])
      .withStage(progress.highestTierReached)
      .withPhaseRun(null)
      .withCombat(null)
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
    const resetRun = phaseRun.resetWaves();
    const resolved = this.encounterResolver.resolve(resetRun.phaseId, resetRun.waveIndex);
    if (!resolved) {
      return { state: state.withHeroes(recovered).withPhaseRun(null).withCombat(null), events: [] };
    }

    const combat = CombatState.start(recovered, resolved.enemies, this.actionTimers, resolved.meta);
    const phase = resolved.phase;

    return {
      state: state
        .withHeroes(recovered)
        .withPhaseRun(resetRun)
        .withCombat(combat)
        .addLog(`Party derrotada em ${phase.displayName}! Reiniciando a fase...`),
      events: ['Party derrotada! Reiniciando a fase...'],
    };
  }
}
