import { GameState } from '../../entities/GameState';
import { CombatState } from '../../entities/CombatState';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { Stats } from '../../value-objects/Stats';
import { PhaseRun } from '../../campaign/PhaseRun';
import { PhaseCombatHandlers } from '../../campaign/PhaseCombatHandlers';
import { CombatProfileProvider } from '../../combat/CombatProfileProvider';
import { scaledDotDamage } from '../../combat/DifficultyCombatScaling';
import {
  COMBAT_DELTA_SECONDS,
  MAX_ACTIONS_PER_TICK,
} from '../../combat/CombatTimingConstants';
import { listEnemyCombatSkills } from '../../progression/combat/EnemyCombatSkillCatalog';
import { listHeroCombatSkills } from '../../progression/combat/HeroCombatSkillCatalog';
import { BASIC_ATTACK_SKILL_ID } from '../../progression/combat/BasicAttackSkill';
import { ActionTimerService } from './ActionTimerService';
import { CombatActionExecutor } from './CombatActionExecutor';
import { CombatFloatingEvent, createDamageEvent } from './CombatFloatingEvent';
import { CombatSkillSelector } from './CombatSkillSelector';
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

    const events: string[] = [];
    const floatingEvents: CombatFloatingEvent[] = [];

    let cooldowns = SkillCooldownTracker.fromMap(combat.skillCooldowns);
    cooldowns = cooldowns.advanceTime(COMBAT_DELTA_SECONDS);

    combat = combat
      .withActionTimers(this.actionTimers.advanceAll(combat.actionTimers, COMBAT_DELTA_SECONDS))
      .withCombatTime(combat.combatTime + COMBAT_DELTA_SECONDS)
      .withSkillCooldowns(cooldowns.toMap())
      .withPendingSkillActions([]);

    let actionsResolved = 0;

    while (actionsResolved < MAX_ACTIONS_PER_TICK) {
      const heroes = workingState.activeHeroes();
      const livingHeroes = heroes.filter((hero) => hero.isAlive());
      const livingEnemies = combat.livingEnemies();
      const phaseRun = workingState.phaseRun;
      const encounterMeta = combat.encounterMeta;

      const outcome = this.tryResolveCombatOutcome(
        workingState,
        combat,
        livingHeroes,
        livingEnemies,
        phaseRun,
        encounterMeta,
        events,
        floatingEvents,
      );
      if (outcome) {
        return outcome;
      }

      const readyActors = this.actionTimers.listReadyActors(
        combat.actionTimers,
        heroes,
        combat.enemies,
      );

      if (readyActors.length === 0) {
        break;
      }

      const strike = this.executeSkillStrike(workingState, combat, readyActors[0]);
      workingState = strike.state;
      combat = strike.combat;
      events.push(...strike.events);
      floatingEvents.push(...strike.floatingEvents);

      if (strike.usedSkillId === null) {
        break;
      }

      actionsResolved += 1;
    }

    combat = combat.withActionTimers(
      this.actionTimers.removeDead(combat.actionTimers, workingState.activeHeroes(), combat.enemies),
    );

    const logMessage = events.join(' · ');

    return this.finish(
      (logMessage ? workingState.addLog(logMessage) : workingState).withCombat(combat).touchTick(),
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

  private tryResolveCombatOutcome(
    state: GameState,
    combat: CombatState,
    livingHeroes: Hero[],
    livingEnemies: Enemy[],
    phaseRun: PhaseRun | null,
    encounterMeta: CombatState['encounterMeta'],
    events: string[],
    floatingEvents: CombatFloatingEvent[],
  ): CombatTurnPhaseResult | null {
    if (livingHeroes.length === 0 && phaseRun) {
      const wiped = this.phaseHandlers.onPhaseWipe(state.withCombat(combat), phaseRun);
      return this.finish(wiped.state, [...events, ...wiped.events], floatingEvents);
    }

    if (livingEnemies.length === 0 && phaseRun && encounterMeta) {
      if (encounterMeta.isBossWave) {
        const victory = this.phaseHandlers.onBossDefeated(
          state,
          combat.enemies,
          state.activeHeroes(),
          encounterMeta,
        );
        return this.finish(victory.state, [...events, ...victory.events], floatingEvents);
      }

      const waveCleared = this.phaseHandlers.onWaveCleared(
        state,
        combat.enemies,
        state.activeHeroes(),
        encounterMeta,
        phaseRun,
      );
      return this.finish(waveCleared.state, [...events, ...waveCleared.events], floatingEvents);
    }

    return null;
  }

  private executeSkillStrike(
    state: GameState,
    combat: CombatState,
    actor: CombatantRef,
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
      const selected = this.skillSelector.selectHeroAction(
        hero,
        heroes,
        enemies,
        cooldowns,
        statusEffects,
      );

      if (!selected) {
        return this.scheduleIdleRecovery(state, combat, actor, attackerProfile);
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
      const selected = this.skillSelector.selectEnemyAction(enemy, heroes, enemies, cooldowns);

      if (!selected) {
        return this.scheduleIdleRecovery(state, combat, actor, attackerProfile);
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

  private scheduleIdleRecovery(
    state: GameState,
    combat: CombatState,
    actor: CombatantRef,
    profile: ReturnType<CombatProfileProvider['forHero']>,
  ): {
    state: GameState;
    combat: CombatState;
    events: string[];
    floatingEvents: CombatFloatingEvent[];
    usedSkillId: string | null;
  } {
    const updatedTimers = this.actionTimers.scheduleAfterAction(
      combat.actionTimers,
      actor,
      profile.attackSpeed,
      profile.castSpeed,
      false,
    );

    return {
      state,
      combat: combat.withActionTimers(updatedTimers),
      events: [],
      floatingEvents: [],
      usedSkillId: null,
    };
  }
}
