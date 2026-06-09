import { GameState } from '../../entities/GameState';
import { CombatState } from '../../entities/CombatState';
import { Hero } from '../../entities/Hero';
import { PhaseRun } from '../../campaign/PhaseRun';
import { PhaseCombatHandlers } from '../../campaign/PhaseCombatHandlers';
import { listEnemyCombatSkills } from '../../progression/combat/EnemyCombatSkillCatalog';
import { listHeroCombatSkills } from '../../progression/combat/HeroCombatSkillCatalog';
import { CombatActionExecutor } from './CombatActionExecutor';
import { CombatFloatingEvent } from './CombatFloatingEvent';
import { CombatSkillSelector } from './CombatSkillSelector';
import { SkillCooldownTracker, combatantKey } from './SkillCooldownTracker';
import { CombatStatusEffectTracker } from './CombatStatusEffectTracker';
import { CombatantRef, TurnOrderService } from './TurnOrderService';

export interface CombatTurnPhaseResult {
  state: GameState;
  events: string[];
  floatingEvents: CombatFloatingEvent[];
}

export class CombatTurnPhase {
  constructor(
    private readonly skillSelector = new CombatSkillSelector(),
    private readonly actionExecutor = new CombatActionExecutor(),
    private readonly turnOrder = new TurnOrderService(),
    private readonly phaseHandlers = new PhaseCombatHandlers(),
  ) {}

  execute(state: GameState): CombatTurnPhaseResult {
    let workingState = state;

    if (!workingState.phaseRun) {
      const phaseRun = PhaseRun.start(workingState.campaignProgress.selectedPhaseId);
      const started = this.phaseHandlers.startPhaseRun(workingState, phaseRun);
      workingState = started.state;
      if (started.events.length > 0) {
        return this.finish(workingState, started.events, []);
      }
    }

    let combat = workingState.combat;
    if (!combat || combat.livingEnemies().length === 0) {
      if (!workingState.phaseRun) {
        return { state: workingState.touchTick(), events: [], floatingEvents: [] };
      }
      const started = this.phaseHandlers.startPhaseRun(workingState, workingState.phaseRun);
      return this.finish(started.state, started.events, []);
    }

    const resolved = this.resolveTurnActor(workingState.heroes, combat);
    combat = resolved.combat;

    if (!resolved.actor) {
      const livingHeroes = workingState.heroes.filter((hero) => hero.isAlive());
      if (livingHeroes.length === 0 && workingState.phaseRun) {
        const wiped = this.phaseHandlers.onPhaseWipe(workingState.withCombat(combat), workingState.phaseRun);
        return this.finish(wiped.state, wiped.events, []);
      }

      return { state: workingState.withCombat(combat).touchTick(), events: [], floatingEvents: [] };
    }

    const turnResult = this.executeActorTurn(workingState, combat, resolved.actor);
    let nextState = turnResult.state;
    const events = turnResult.events;
    const floatingEvents = turnResult.floatingEvents;
    let nextCombat = turnResult.combat.advanceTurn();

    const livingHeroes = nextState.heroes.filter((hero) => hero.isAlive());
    const livingEnemies = nextCombat.livingEnemies();
    const phaseRun = nextState.phaseRun;
    const encounterMeta = nextCombat.encounterMeta;

    if (livingHeroes.length === 0 && phaseRun) {
      const wiped = this.phaseHandlers.onPhaseWipe(nextState, phaseRun);
      return this.finish(wiped.state, [...events, ...wiped.events], floatingEvents);
    }

    if (livingEnemies.length === 0 && phaseRun && encounterMeta) {
      if (encounterMeta.isBossWave) {
        const victory = this.phaseHandlers.onBossDefeated(
          nextState,
          nextCombat.enemies,
          nextState.heroes,
          encounterMeta,
        );
        return this.finish(victory.state, [...events, ...victory.events], floatingEvents);
      }

      const waveCleared = this.phaseHandlers.onWaveCleared(
        nextState,
        nextCombat.enemies,
        nextState.heroes,
        encounterMeta,
        phaseRun,
      );
      return this.finish(waveCleared.state, [...events, ...waveCleared.events], floatingEvents);
    }

    nextCombat = this.ensureTurnQueue(nextState.heroes, nextCombat);
    const logMessage = events.join(' · ');

    return this.finish(
      (logMessage ? nextState.addLog(logMessage) : nextState).withCombat(nextCombat).touchTick(),
      events,
      floatingEvents,
    );
  }

  private finish(
    state: GameState,
    events: string[],
    floatingEvents: CombatFloatingEvent[],
  ): CombatTurnPhaseResult {
    return { state, events, floatingEvents };
  }

  private ensureTurnQueue(heroes: Hero[], combat: CombatState): CombatState {
    if (!combat.needsNewRound() && combat.turnQueue.length > 0) {
      return combat;
    }

    const order = this.turnOrder.buildRoundOrder(heroes, combat.livingEnemies());
    return CombatState.restore({
      ...combat.toProps(),
      turnQueue: order,
      turnIndex: 0,
    });
  }

  private resolveTurnActor(
    heroes: Hero[],
    combat: CombatState,
  ): { actor: CombatantRef | null; combat: CombatState } {
    let currentCombat = combat;
    const guard = Math.max(2, currentCombat.turnQueue.length + 2);

    for (let step = 0; step < guard; step++) {
      currentCombat = this.ensureTurnQueue(heroes, currentCombat);
      const actor = currentCombat.currentActor();
      if (!actor) {
        return { actor: null, combat: currentCombat };
      }

      if (this.isActorAlive(actor, heroes, currentCombat)) {
        return { actor, combat: currentCombat };
      }

      currentCombat = currentCombat.advanceTurn();
    }

    return { actor: null, combat: currentCombat };
  }

  private isActorAlive(actor: CombatantRef, heroes: Hero[], combat: CombatState): boolean {
    if (actor.side === 'hero') {
      return heroes.some((hero) => hero.id === actor.id && hero.isAlive());
    }

    return Boolean(combat.findEnemy(actor.id)?.isAlive());
  }

  private executeActorTurn(
    state: GameState,
    combat: CombatState,
    actor: CombatantRef,
  ): {
    state: GameState;
    combat: CombatState;
    events: string[];
    floatingEvents: CombatFloatingEvent[];
  } {
    let heroes = state.heroes;
    let enemies = combat.enemies;
    const events: string[] = [];
    const floatingEvents: CombatFloatingEvent[] = [];
    const cooldowns = SkillCooldownTracker.fromMap(combat.skillCooldowns);
    let statusEffects = CombatStatusEffectTracker.fromMap(combat.statusEffects);
    const actorKey = combatantKey(actor.side, actor.id);
    let usedSkillId: string | null = null;
    let skillList = [] as ReturnType<typeof listHeroCombatSkills>;
    let statusApplications: ReturnType<typeof this.actionExecutor.execute>['statusApplications'] = [];

    if (actor.side === 'hero') {
      const hero = heroes.find((entry) => entry.id === actor.id);
      if (!hero?.isAlive()) {
        return { state, combat, events, floatingEvents };
      }

      skillList = listHeroCombatSkills(hero);
      const selected = this.skillSelector.selectHeroAction(
        hero,
        heroes,
        enemies,
        cooldowns,
        statusEffects,
      );
      if (!selected) {
        return { state, combat, events, floatingEvents };
      }

      usedSkillId = selected.skillId;
      const result = this.actionExecutor.execute(
        selected.action,
        hero.name,
        heroes,
        enemies,
        statusEffects,
      );
      heroes = result.heroes;
      enemies = result.enemies;
      statusApplications = result.statusApplications;
      if (result.event) events.push(result.event);
      floatingEvents.push(...result.floatingEvents);
    } else {
      const enemy = enemies.find((entry) => entry.id === actor.id);
      if (!enemy?.isAlive()) {
        return { state, combat, events, floatingEvents };
      }

      skillList = listEnemyCombatSkills(enemy);
      const selected = this.skillSelector.selectEnemyAction(enemy, heroes, enemies, cooldowns);
      if (!selected) {
        return { state, combat, events, floatingEvents };
      }

      usedSkillId = selected.skillId;
      const result = this.actionExecutor.execute(
        selected.action,
        enemy.name,
        heroes,
        enemies,
        statusEffects,
      );
      heroes = result.heroes;
      enemies = result.enemies;
      statusApplications = result.statusApplications;
      if (result.event) events.push(result.event);
      floatingEvents.push(...result.floatingEvents);
    }

    for (const application of statusApplications) {
      statusEffects = statusEffects.apply({
        combatantKey: application.combatantKey,
        skillId: application.skillId,
        kind: application.kind,
        magnitude: application.magnitude,
        durationTurns: application.durationTurns,
      });
    }

    statusEffects = statusEffects.tickOnTurnEnd(actorKey);
    const updatedCooldowns = cooldowns.onTurnEnd(actorKey, usedSkillId, skillList).toMap();

    return {
      state: state.withHeroes(heroes),
      combat: combat
        .withEnemies(enemies)
        .withSkillCooldowns(updatedCooldowns)
        .withStatusEffects(statusEffects.toMap()),
      events,
      floatingEvents,
    };
  }
}
