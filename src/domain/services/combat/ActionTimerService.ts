import { Enemy } from '../../entities/Enemy';
import { Hero } from '../../entities/Hero';
import { CombatProfileProvider } from '../../combat/CombatProfileProvider';
import {
  MIN_ACTION_INTERVAL_SECONDS,
  SKILL_ACTION_RECOVERY_SECONDS,
} from '../../combat/CombatTimingConstants';
import { combatantKey } from './SkillCooldownTracker';
import { CombatantRef } from './TurnOrderService';

export type ActionTimerMap = Record<string, number>;

export class ActionTimerService {
  constructor(private readonly profiles = new CombatProfileProvider()) {}

  createInitial(heroes: Hero[], enemies: Enemy[]): ActionTimerMap {
    const timers: ActionTimerMap = {};
    let stagger = 0;

    for (const hero of heroes.filter((entry) => entry.isAlive())) {
      const key = combatantKey('hero', hero.id);
      timers[key] = stagger;
      stagger += 0.12 / this.profiles.forHero(hero).attackSpeed;
    }

    for (const enemy of enemies.filter((entry) => entry.isAlive())) {
      const key = combatantKey('enemy', enemy.id);
      timers[key] = stagger;
      stagger += 0.12 / this.profiles.forEnemy(enemy).attackSpeed;
    }

    return timers;
  }

  advanceAll(timers: ActionTimerMap, elapsedSeconds: number): ActionTimerMap {
    const next = structuredClone(timers);
    for (const key of Object.keys(next)) {
      next[key] -= elapsedSeconds;
    }
    return next;
  }

  resolveNextActor(
    timers: ActionTimerMap,
    heroes: Hero[],
    enemies: Enemy[],
  ): { actor: CombatantRef | null; elapsedSeconds: number; timers: ActionTimerMap } {
    const living = this.listLivingCombatants(heroes, enemies);
    if (living.length === 0) {
      return { actor: null, elapsedSeconds: 0, timers };
    }

    const readyTimes = living.map((entry) => timers[entry.key] ?? 0);
    const minTimer = Math.min(...readyTimes);
    const elapsedSeconds = Math.max(0, minTimer);
    const advanced = this.advanceAll(timers, elapsedSeconds);

    const ready = living
      .filter((entry) => (advanced[entry.key] ?? 0) <= 0)
      .sort((left, right) => {
        const leftTimer = advanced[left.key] ?? 0;
        const rightTimer = advanced[right.key] ?? 0;
        if (leftTimer !== rightTimer) return leftTimer - rightTimer;
        return left.tieBreaker - right.tieBreaker;
      });

    if (ready.length === 0) {
      return { actor: null, elapsedSeconds, timers: advanced };
    }

    const picked = ready[0];
    return {
      actor: { side: picked.side, id: picked.id },
      elapsedSeconds,
      timers: advanced,
    };
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

    return {
      ...timers,
      [key]: (timers[key] ?? 0) + interval,
    };
  }

  removeDead(timers: ActionTimerMap, heroes: Hero[], enemies: Enemy[]): ActionTimerMap {
    const livingKeys = new Set(
      this.listLivingCombatants(heroes, enemies).map((entry) => entry.key),
    );
    const next = structuredClone(timers);

    for (const key of Object.keys(next)) {
      if (!livingKeys.has(key)) {
        delete next[key];
      }
    }

    return next;
  }

  private listLivingCombatants(heroes: Hero[], enemies: Enemy[]) {
    const entries: Array<{
      key: string;
      side: 'hero' | 'enemy';
      id: string;
      tieBreaker: number;
    }> = [];

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
