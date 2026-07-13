import { Enemy } from '../../entities/Enemy';
import { Hero } from '../../entities/Hero';
import { CombatProfileProvider } from '../../combat/CombatProfileProvider';
import {
  MIN_ACTION_INTERVAL_SECONDS,
  SKILL_ACTION_RECOVERY_SECONDS,
} from '../../combat/CombatTimingConstants';
import { combatantKey } from './SkillCooldownTracker';
import { CombatantRef } from './TurnOrderService';
import {
  ActionTimerEntry,
  ActionTimerMap,
  normalizeActionTimerEntry,
  normalizeActionTimerMap,
  resolveActionTimeRatio,
} from './ActionTimerTypes';

export type { ActionTimerEntry, ActionTimerMap } from './ActionTimerTypes';
export { normalizeActionTimerMap, resolveActionTimeRatio } from './ActionTimerTypes';

interface LivingCombatant {
  key: string;
  side: 'hero' | 'enemy';
  id: string;
  tieBreaker: number;
}

export class ActionTimerService {
  constructor(private readonly profiles = new CombatProfileProvider()) {}

  createInitial(heroes: Hero[], enemies: Enemy[]): ActionTimerMap {
    const timers: ActionTimerMap = {};
    let stagger = 0;

    for (const hero of heroes.filter((entry) => entry.isAlive())) {
      const key = combatantKey('hero', hero.id);
      timers[key] = { remaining: stagger, total: Math.max(stagger, MIN_ACTION_INTERVAL_SECONDS) };
      stagger += 0.12 / this.profiles.forHero(hero).attackSpeed;
    }

    for (const enemy of enemies.filter((entry) => entry.isAlive())) {
      const key = combatantKey('enemy', enemy.id);
      timers[key] = { remaining: stagger, total: Math.max(stagger, MIN_ACTION_INTERVAL_SECONDS) };
      stagger += 0.12 / this.profiles.forEnemy(enemy).attackSpeed;
    }

    return timers;
  }

  advanceAll(timers: ActionTimerMap, elapsedSeconds: number): ActionTimerMap {
    const next = normalizeActionTimerMap(timers);
    for (const key of Object.keys(next)) {
      next[key] = {
        ...next[key],
        remaining: next[key].remaining - elapsedSeconds,
      };
    }
    return next;
  }

  /** Combatentes prontos para agir (timer ≤ 0), ordenados por prioridade de fila. */
  listReadyActors(timers: ActionTimerMap, heroes: Hero[], enemies: Enemy[]): CombatantRef[] {
    return this.listLivingCombatants(heroes, enemies)
      .filter((entry) => normalizeActionTimerEntry(timers[entry.key]).remaining <= 0)
      .sort((left, right) => this.compareQueueOrder(timers, left, right))
      .map((entry) => ({ side: entry.side, id: entry.id }));
  }

  /** Próximo a agir (para UI). Retorna null se ninguém está pronto. */
  peekNextActor(timers: ActionTimerMap, heroes: Hero[], enemies: Enemy[]): CombatantRef | null {
    return this.listReadyActors(timers, heroes, enemies)[0] ?? null;
  }

  scheduleAfterAction(
    timers: ActionTimerMap,
    actor: CombatantRef,
    attackSpeed: number,
    castSpeed: number,
    usedSkill: boolean,
  ): ActionTimerMap {
    const key = combatantKey(actor.side, actor.id);
    const interval = usedSkill
      ? Math.max(MIN_ACTION_INTERVAL_SECONDS, SKILL_ACTION_RECOVERY_SECONDS / castSpeed)
      : Math.max(MIN_ACTION_INTERVAL_SECONDS, 1 / attackSpeed);
    const current = normalizeActionTimerEntry(timers[key]);
    const debt = Math.min(current.remaining, 0);

    return {
      ...normalizeActionTimerMap(timers),
      [key]: { remaining: debt + interval, total: interval },
    };
  }

  removeDead(timers: ActionTimerMap, heroes: Hero[], enemies: Enemy[]): ActionTimerMap {
    const livingKeys = new Set(
      this.listLivingCombatants(heroes, enemies).map((entry) => entry.key),
    );
    const next = normalizeActionTimerMap(timers);

    for (const key of Object.keys(next)) {
      if (!livingKeys.has(key)) {
        delete next[key];
      }
    }

    return next;
  }

  private compareQueueOrder(
    timers: ActionTimerMap,
    left: LivingCombatant,
    right: LivingCombatant,
  ): number {
    const leftTimer = normalizeActionTimerEntry(timers[left.key]).remaining;
    const rightTimer = normalizeActionTimerEntry(timers[right.key]).remaining;
    if (leftTimer !== rightTimer) return leftTimer - rightTimer;
    return left.tieBreaker - right.tieBreaker;
  }

  private listLivingCombatants(heroes: Hero[], enemies: Enemy[]): LivingCombatant[] {
    const entries: LivingCombatant[] = [];

    heroes.forEach((hero, index) => {
      if (!hero.isAlive()) return;
      entries.push({
        key: combatantKey('hero', hero.id),
        side: 'hero',
        id: hero.id,
        tieBreaker: index,
      });
    });

    enemies.forEach((enemy, index) => {
      if (!enemy.isAlive()) return;
      entries.push({
        key: combatantKey('enemy', enemy.id),
        side: 'enemy',
        id: enemy.id,
        tieBreaker: 100 + index,
      });
    });

    return entries;
  }
}
