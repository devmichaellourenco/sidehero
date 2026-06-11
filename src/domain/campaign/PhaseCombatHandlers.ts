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
    const totalGold = defeatedEnemies.reduce((sum, enemy) => sum + enemy.goldReward, 0);
    const enemyNames = defeatedEnemies.map((enemy) => enemy.name).join(', ');
    const nextRun = phaseRun.advanceWave();
    const resolved = this.encounterResolver.resolve(nextRun.phaseId, nextRun.waveIndex);

    if (!resolved) {
      return { state: state.withHeroes(heroes), events: [] };
    }

    const combat = CombatState.start(heroes, resolved.enemies, this.actionTimers, resolved.meta);
    const waveLabel = `${nextRun.waveIndex + 1}/${resolved.meta.waveCount}`;

    let nextState = state
      .withGold(state.gold.add(totalGold))
      .withHeroes(heroes)
      .withPhaseRun(nextRun)
      .withCombat(combat)
      .addLog(`${enemyNames} derrotado(s)! +${totalGold} ouro · Wave ${waveLabel}`);

    if (!meta.isBossWave && Math.random() < 0.12) {
      const chest = Chest.create(resolved.phase.difficultyTier, 'monster');
      nextState = nextState.withChests([...nextState.chests, chest]).addLog('📦 Baú de monstro dropou!');
    }

    return {
      state: nextState.touchTick(),
      events: [`Wave ${waveLabel} iniciada`, `+${totalGold} ouro`],
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

    const totalGold = defeatedEnemies.reduce((sum, enemy) => sum + enemy.goldReward, 0);
    const totalXp = defeatedEnemies.reduce((sum, enemy) => sum + enemy.xpReward, 0);
    const enemyNames = defeatedEnemies.map((enemy) => enemy.name).join(', ');

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

    let nextState = state
      .withCampaignProgress(progress)
      .withGold(state.gold.add(totalGold))
      .withRosterHeroes([...recoveredHeroes, ...benchUpdates])
      .withStage(progress.highestTierReached)
      .withPhaseRun(null)
      .withCombat(null)
      .incrementBattlesWon()
      .addLog(
        phase.seasonFinale
          ? `🏆 Temporada concluída! Boss final derrotado em ${phase.displayName}! +${totalGold} ouro, +${totalXp} XP · Party recuperada`
          : `Boss derrotado em ${phase.displayName}! +${totalGold} ouro, +${totalXp} XP · Party recuperada${
              benchXp > 0 && benchUpdates.length > 0 ? ` · Reserva +${benchXp} XP` : ''
            }`,
      );

    const events = phase.seasonFinale
      ? ['🏆 Temporada concluída!', `${phase.displayName} finalizada!`, `+${totalGold} ouro`, `+${totalXp} XP`]
      : [`${phase.displayName} concluída!`, `+${totalGold} ouro`, `+${totalXp} XP`];

    if (nextState.totalBattlesWon % CHEST_EVERY_N_WINS === 0) {
      const chestType: ChestType = phase.seasonFinale ? 'act_boss' : 'boss';
      const chest = Chest.create(phase.difficultyTier, chestType);
      nextState = nextState.withChests([...nextState.chests, chest]).addLog('📦 Baú dropou no painel!');
      events.push('Baú obtido!');
    }

    return { state: nextState.touchTick(), events };
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
