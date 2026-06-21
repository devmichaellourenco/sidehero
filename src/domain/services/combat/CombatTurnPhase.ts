import { GameState } from '../../entities/GameState';
import { CombatState } from '../../entities/CombatState';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { Stats } from '../../value-objects/Stats';
import { PhaseRun } from '../../campaign/PhaseRun';
import { PhaseCombatHandlers } from '../../campaign/PhaseCombatHandlers';
import { CombatProfileProvider } from '../../combat/CombatProfileProvider';
import { scaledDotDamage } from '../../combat/DifficultyCombatScaling';
import { MULTI_SKILL_STAGGER_SECONDS } from '../../combat/CombatTimingConstants';
import { listEnemyCombatSkills } from '../../progression/combat/EnemyCombatSkillCatalog';
import { listHeroCombatSkills } from '../../progression/combat/HeroCombatSkillCatalog';
import { BASIC_ATTACK_SKILL_ID } from '../../progression/combat/BasicAttackSkill';
import { ActionTimerService } from './ActionTimerService';
import { CombatActionExecutor } from './CombatActionExecutor';
import { CombatFloatingEvent, createDamageEvent } from './CombatFloatingEvent';
import { CombatSkillSelector, SelectedCombatAction } from './CombatSkillSelector';
import { PendingSkillAction } from './PendingSkillAction';
import { SkillCooldownTracker, combatantKey } from './SkillCooldownTracker';
import { CombatStatusEffectTracker } from './CombatStatusEffectTracker';
import { CombatantRef } from './TurnOrderService';

export interface CombatTurnPhaseResult {
  state: GameState;
  events: string[];
  floatingEvents: CombatFloatingEvent[];
}

export class CombatTurnPhase {
  constructor(
    private readonly skillSelector = new CombatSkillSelector(),
    private readonly actionExecutor = new CombatActionExecutor(),
    private readonly actionTimers = new ActionTimerService(),
    private readonly profiles = new CombatProfileProvider(),
    private readonly phaseHandlers = new PhaseCombatHandlers(),
  ) {}

  execute(state: GameState): CombatTurnPhaseResult {
    let workingState = state;

    if (workingState.loadoutEditOpen && workingState.phaseRestartOnResume) {
      return { state: workingState.touchTick(), events: [], floatingEvents: [] };
    }

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

    const heroes = workingState.activeHeroes();
    const timeline = this.actionTimers.resolveNextActor(
      combat.actionTimers,
      heroes,
      combat.enemies,
    );

    let cooldowns = SkillCooldownTracker.fromMap(combat.skillCooldowns);
    cooldowns = this.advanceSkillCooldowns(
      cooldowns,
      timeline.elapsedSeconds,
      heroes,
      combat.enemies,
      combat.encounterMeta?.isBossWave ?? false,
    );

    combat = combat
      .withActionTimers(timeline.timers)
      .withCombatTime(combat.combatTime + timeline.elapsedSeconds)
      .withSkillCooldowns(cooldowns.toMap());

    const pendingResult = this.processPendingSkillActions(workingState, combat);
    if (pendingResult.handled) {
      return this.finish(
        pendingResult.state.withCombat(pendingResult.combat).touchTick(),
        pendingResult.events,
        pendingResult.floatingEvents,
      );
    }
    combat = pendingResult.combat;

    if (!timeline.actor) {
      const livingHeroes = heroes.filter((hero) => hero.isAlive());
      if (livingHeroes.length === 0 && workingState.phaseRun) {
        const wiped = this.phaseHandlers.onPhaseWipe(workingState.withCombat(combat), workingState.phaseRun);
        return this.finish(wiped.state, wiped.events, []);
      }

      return { state: workingState.withCombat(combat).touchTick(), events: [], floatingEvents: [] };
    }

    const turnResult = this.executeActorTurn(workingState, combat, timeline.actor);
    let nextState = turnResult.state;
    const events = turnResult.events;
    const floatingEvents = turnResult.floatingEvents;
    let nextCombat = turnResult.combat;

    const livingHeroes = nextState.activeHeroes().filter((hero) => hero.isAlive());
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
          nextState.activeHeroes(),
          encounterMeta,
        );
        return this.finish(victory.state, [...events, ...victory.events], floatingEvents);
      }

      const waveCleared = this.phaseHandlers.onWaveCleared(
        nextState,
        nextCombat.enemies,
        nextState.activeHeroes(),
        encounterMeta,
        phaseRun,
      );
      return this.finish(waveCleared.state, [...events, ...waveCleared.events], floatingEvents);
    }

    nextCombat = nextCombat.withActionTimers(
      this.actionTimers.removeDead(nextCombat.actionTimers, nextState.activeHeroes(), nextCombat.enemies),
    );

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

  private advanceSkillCooldowns(
    cooldowns: SkillCooldownTracker,
    elapsedSeconds: number,
    heroes: Hero[],
    enemies: CombatState['enemies'],
    isBossWave: boolean,
  ): SkillCooldownTracker {
    if (elapsedSeconds <= 0) return cooldowns;

    let tracker = cooldowns;

    for (const hero of heroes) {
      const key = combatantKey('hero', hero.id);
      tracker = tracker.advanceKey(key, elapsedSeconds, this.profiles.forHero(hero).castSpeed);
    }

    for (const enemy of enemies) {
      const key = combatantKey('enemy', enemy.id);
      tracker = tracker.advanceKey(key, elapsedSeconds, this.profiles.forEnemy(enemy, isBossWave).castSpeed);
    }

    return tracker;
  }

  private processPendingSkillActions(
    state: GameState,
    combat: CombatState,
  ): {
    handled: boolean;
    state: GameState;
    combat: CombatState;
    events: string[];
    floatingEvents: CombatFloatingEvent[];
  } {
    const due = combat.pendingSkillActions
      .filter((entry) => entry.executeAt <= combat.combatTime)
      .sort((left, right) => left.executeAt - right.executeAt);

    if (due.length === 0) {
      return { handled: false, state, combat, events: [], floatingEvents: [] };
    }

    const next = due[0];
    const remaining = combat.pendingSkillActions.filter((entry) => entry !== next);
    const actor: CombatantRef = { side: next.side, id: next.combatantId };
    const strike = this.executeSkillStrike(state, combat, actor, next.skillId);

    return {
      handled: true,
      state: strike.state,
      combat: strike.combat.withPendingSkillActions(remaining),
      events: strike.events,
      floatingEvents: strike.floatingEvents,
    };
  }

  private executeSkillStrike(
    state: GameState,
    combat: CombatState,
    actor: CombatantRef,
    forcedSkillId?: string,
  ): {
    state: GameState;
    combat: CombatState;
    events: string[];
    floatingEvents: CombatFloatingEvent[];
    usedSkillId: string | null;
  } {
    let heroes = state.activeHeroes();
    let enemies = combat.enemies;
    const events: string[] = [];
    const floatingEvents: CombatFloatingEvent[] = [];
    let cooldowns = SkillCooldownTracker.fromMap(combat.skillCooldowns);
    let statusEffects = CombatStatusEffectTracker.fromMap(combat.statusEffects);
    const actorKey = combatantKey(actor.side, actor.id);
    let usedSkillId: string | null = null;
    let skillList = [] as ReturnType<typeof listHeroCombatSkills>;
    let statusApplications: ReturnType<typeof this.actionExecutor.execute>['statusApplications'] = [];
    const stageLevel = state.difficultyTier;
    let attackerProfile = this.profiles.forHero(heroes[0]);

    if (actor.side === 'hero') {
      const hero = heroes.find((entry) => entry.id === actor.id);
      if (!hero?.isAlive()) {
        return { state, combat, events, floatingEvents, usedSkillId: null };
      }

      attackerProfile = this.profiles.forHero(hero);
      skillList = listHeroCombatSkills(hero);
      const selected = forcedSkillId
        ? this.findSelectedAction(
            this.skillSelector.selectAllReadyHeroActions(
              hero,
              heroes,
              enemies,
              cooldowns,
              statusEffects,
            ),
            forcedSkillId,
          )
        : this.skillSelector.selectAllReadyHeroActions(hero, heroes, enemies, cooldowns, statusEffects)[0] ??
          null;

      if (!selected) {
        return { state, combat, events, floatingEvents, usedSkillId: null };
      }

      usedSkillId = selected.skillId;
      const result = this.actionExecutor.execute(
        selected.action,
        hero.name,
        heroes,
        enemies,
        statusEffects,
        { attackerProfile, stageLevel },
      );
      heroes = result.heroes;
      enemies = result.enemies;
      statusApplications = result.statusApplications;
      if (result.event) events.push(result.event);
      floatingEvents.push(...result.floatingEvents);
    } else {
      const enemy = enemies.find((entry) => entry.id === actor.id);
      if (!enemy?.isAlive()) {
        return { state, combat, events, floatingEvents, usedSkillId: null };
      }

      attackerProfile = this.profiles.forEnemy(enemy, combat.encounterMeta?.isBossWave);
      skillList = listEnemyCombatSkills(enemy);
      const selected = forcedSkillId
        ? this.findSelectedAction(
            this.skillSelector.selectAllReadyEnemyActions(enemy, heroes, enemies, cooldowns),
            forcedSkillId,
          )
        : this.skillSelector.selectAllReadyEnemyActions(enemy, heroes, enemies, cooldowns)[0] ??
          null;

      if (!selected) {
        return { state, combat, events, floatingEvents, usedSkillId: null };
      }

      usedSkillId = selected.skillId;
      const result = this.actionExecutor.execute(
        selected.action,
        enemy.name,
        heroes,
        enemies,
        statusEffects,
        { attackerProfile, stageLevel },
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
        dotElement: application.dotElement,
      });
    }

    const dotTick = statusEffects.tickDotDamage(actorKey);
    if (dotTick.damage > 0) {
      const dotDamage = scaledDotDamage(dotTick.damage, stageLevel);
      if (actor.side === 'hero') {
        const hero = heroes.find((entry) => entry.id === actor.id);
        if (hero?.isAlive()) {
          const beforeHealth = hero.currentHealth;
          heroes = heroes.map((entry) =>
            entry.id === actor.id
              ? Hero.restore({
                  ...entry.toProps(),
                  currentHealth: Math.max(0, entry.currentHealth - dotDamage),
                })
              : entry,
          );
          const after = heroes.find((entry) => entry.id === actor.id)!;
          const damageEvent = createDamageEvent(
            'hero',
            actor.id,
            beforeHealth,
            after.currentHealth,
            false,
            dotTick.dotElement,
          );
          if (damageEvent) floatingEvents.push(damageEvent);
          events.push(`${hero.name} sofre ${dotDamage} de dano contínuo`);
        }
      } else {
        const enemy = enemies.find((entry) => entry.id === actor.id);
        if (enemy?.isAlive()) {
          const beforeHealth = enemy.stats.currentHealth;
          const updated = Enemy.restore({
            ...enemy.toProps(),
            stats: Stats.create({
              ...enemy.stats.toProps(),
              currentHealth: Math.max(0, enemy.stats.currentHealth - dotDamage),
            }),
          });
          enemies = enemies.map((entry) => (entry.id === actor.id ? updated : entry));
          const damageEvent = createDamageEvent(
            'enemy',
            actor.id,
            beforeHealth,
            updated.stats.currentHealth,
            false,
            dotTick.dotElement,
          );
          if (damageEvent) floatingEvents.push(damageEvent);
          events.push(`${enemy.name} sofre ${dotDamage} de dano contínuo`);
        }
      }
    }

    statusEffects = statusEffects.tickOnTurnEnd(actorKey);

    const castSpeed = attackerProfile.castSpeed;
    const updatedCooldowns = cooldowns
      .onSkillUsed(actorKey, usedSkillId, skillList, castSpeed)
      .toMap();

    const usedSkill = usedSkillId !== null && usedSkillId !== BASIC_ATTACK_SKILL_ID;
    const updatedTimers = this.actionTimers.scheduleAfterAction(
      combat.actionTimers,
      actor,
      attackerProfile.attackSpeed,
      castSpeed,
      usedSkill,
    );

    return {
      state: state.withHeroes(heroes),
      combat: combat
        .withEnemies(enemies)
        .withSkillCooldowns(updatedCooldowns)
        .withStatusEffects(statusEffects.toMap())
        .withActionTimers(updatedTimers),
      events,
      floatingEvents,
      usedSkillId,
    };
  }

  private findSelectedAction(
    actions: SelectedCombatAction[],
    skillId: string,
  ): SelectedCombatAction | null {
    return actions.find((entry) => entry.skillId === skillId) ?? null;
  }

  private queueFollowUpSkills(
    combat: CombatState,
    actor: CombatantRef,
    followUps: SelectedCombatAction[],
  ): PendingSkillAction[] {
    return followUps.map((entry, index) => ({
      side: actor.side,
      combatantId: actor.id,
      skillId: entry.skillId,
      executeAt: combat.combatTime + MULTI_SKILL_STAGGER_SECONDS * (index + 1),
    }));
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
    let heroes = state.activeHeroes();
    let enemies = combat.enemies;
    const actorKey = combatantKey(actor.side, actor.id);
    let cooldowns = SkillCooldownTracker.fromMap(combat.skillCooldowns);
    const statusEffects = CombatStatusEffectTracker.fromMap(combat.statusEffects);

    let readyActions: SelectedCombatAction[] = [];
    if (actor.side === 'hero') {
      const hero = heroes.find((entry) => entry.id === actor.id);
      if (!hero?.isAlive()) {
        return { state, combat, events: [], floatingEvents: [] };
      }
      readyActions = this.skillSelector.selectAllReadyHeroActions(
        hero,
        heroes,
        enemies,
        cooldowns,
        statusEffects,
      );
    } else {
      const enemy = enemies.find((entry) => entry.id === actor.id);
      if (!enemy?.isAlive()) {
        return { state, combat, events: [], floatingEvents: [] };
      }
      readyActions = this.skillSelector.selectAllReadyEnemyActions(enemy, heroes, enemies, cooldowns);
    }

    if (readyActions.length === 0) {
      return { state, combat, events: [], floatingEvents: [] };
    }

    const [first, ...followUps] = readyActions;
    const strike = this.executeSkillStrike(state, combat, actor, first.skillId);
    const pending = [
      ...combat.pendingSkillActions.filter(
        (entry) => !(entry.side === actor.side && entry.combatantId === actor.id),
      ),
      ...this.queueFollowUpSkills(combat, actor, followUps),
    ];

    return {
      state: strike.state,
      combat: strike.combat.withPendingSkillActions(pending),
      events: strike.events,
      floatingEvents: strike.floatingEvents,
    };
  }
}
