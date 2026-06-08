import { GameState } from '../../entities/GameState';
import { CombatState } from '../../entities/CombatState';
import { Hero } from '../../entities/Hero';
import { listEnemyCombatSkills } from '../../progression/combat/EnemyCombatSkillCatalog';
import { listHeroCombatSkills } from '../../progression/combat/HeroCombatSkillCatalog';
import { CombatActionExecutor } from './CombatActionExecutor';
import { CombatFloatingEvent } from './CombatFloatingEvent';
import { CombatSkillSelector } from './CombatSkillSelector';
import { spawnEncounterForStage } from './EncounterSpawner';
import { SkillCooldownTracker, combatantKey } from './SkillCooldownTracker';
import { CombatantRef, TurnOrderService } from './TurnOrderService';
import { VictoryRewardPhase } from './VictoryRewardPhase';

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
    private readonly victoryReward = new VictoryRewardPhase(),
  ) {}

  execute(state: GameState): CombatTurnPhaseResult {
    let combat = state.combat;
    if (!combat || combat.livingEnemies().length === 0) {
      const enemies = spawnEncounterForStage(state.stage);
      combat = CombatState.start(state.heroes, enemies, this.turnOrder);
      return {
        state: state.withCombat(combat).addLog('Novo inimigo apareceu no painel!'),
        events: ['Novo inimigo apareceu no painel!'],
        floatingEvents: [],
      };
    }

    combat = this.ensureTurnQueue(state.heroes, combat);
    const active = this.getNextLivingActor(state.heroes, combat);
    if (!active) {
      return {
        state: state.withCombat(combat).touchTick(),
        events: [],
        floatingEvents: [],
      };
    }

    const turnResult = this.executeActorTurn(state, active.combat, active.actor);
    let nextState = turnResult.state;
    const events = turnResult.events;
    const floatingEvents = turnResult.floatingEvents;
    let nextCombat = turnResult.combat.advanceTurn();

    const livingHeroes = nextState.heroes.filter((hero) => hero.isAlive());
    const livingEnemies = nextCombat.livingEnemies();

    if (livingHeroes.length === 0) {
      const recovered = nextState.heroes.map((hero) => hero.healFull());
      const enemies = spawnEncounterForStage(nextState.stage);
      const freshCombat = CombatState.start(recovered, enemies, this.turnOrder);
      const wipeMessage = [...events, 'Party derrotada! Recuperando no painel...'].join(' · ');
      return {
        state: nextState
          .withHeroes(recovered)
          .withCombat(freshCombat)
          .addLog(wipeMessage),
        events: [...events, 'Party derrotada! Recuperando no painel...'],
        floatingEvents,
      };
    }

    if (livingEnemies.length === 0) {
      const defeated = nextCombat.enemies;
      const victory = this.victoryReward.execute(nextState, defeated, nextState.heroes);
      return {
        state: victory.state,
        events: [...events, ...victory.events],
        floatingEvents,
      };
    }

    nextCombat = this.ensureTurnQueue(nextState.heroes, nextCombat);
    const logMessage = events.join(' · ');

    return {
      state: (logMessage ? nextState.addLog(logMessage) : nextState)
        .withCombat(nextCombat)
        .touchTick(),
      events,
      floatingEvents,
    };
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

  private getNextLivingActor(
    heroes: Hero[],
    combat: CombatState,
  ): { actor: CombatantRef; combat: CombatState } | null {
    let currentCombat = combat;
    const maxSkips = Math.max(1, currentCombat.turnQueue.length);

    for (let skip = 0; skip < maxSkips; skip++) {
      const actor = currentCombat.currentActor();
      if (!actor) return null;

      const isAlive =
        actor.side === 'hero'
          ? heroes.some((hero) => hero.id === actor.id && hero.isAlive())
          : Boolean(currentCombat.findEnemy(actor.id)?.isAlive());

      if (isAlive) {
        return { actor, combat: currentCombat };
      }

      currentCombat = currentCombat.advanceTurn();
    }

    return null;
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
    const actorKey = combatantKey(actor.side, actor.id);
    let usedSkillId: string | null = null;
    let skillList = [] as ReturnType<typeof listHeroCombatSkills>;

    if (actor.side === 'hero') {
      const hero = heroes.find((entry) => entry.id === actor.id);
      if (!hero?.isAlive()) {
        return { state, combat, events, floatingEvents };
      }

      skillList = listHeroCombatSkills(hero);
      const selected = this.skillSelector.selectHeroAction(hero, heroes, enemies, cooldowns);
      if (!selected) {
        return { state, combat, events, floatingEvents };
      }

      usedSkillId = selected.skillId;
      const result = this.actionExecutor.execute(selected.action, hero.name, heroes, enemies);
      heroes = result.heroes;
      enemies = result.enemies;
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
      const result = this.actionExecutor.execute(selected.action, enemy.name, heroes, enemies);
      heroes = result.heroes;
      enemies = result.enemies;
      if (result.event) events.push(result.event);
      floatingEvents.push(...result.floatingEvents);
    }

    const updatedCooldowns = cooldowns.onTurnEnd(actorKey, usedSkillId, skillList).toMap();

    return {
      state: state.withHeroes(heroes),
      combat: combat.withEnemies(enemies).withSkillCooldowns(updatedCooldowns),
      events,
      floatingEvents,
    };
  }
}
