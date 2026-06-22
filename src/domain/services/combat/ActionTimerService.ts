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

  /** Combatentes prontos para agir (timer ≤ 0), ordenados por prioridade de fila. */
  listReadyActors(timers: ActionTimerMap, heroes: Hero[], enemies: Enemy[]): CombatantRef[] {
    return this.listLivingCombatants(heroes, enemies)
      .filter((entry) => (timers[entry.key] ?? 0) <= 0)
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

  private compareQueueOrder(
    timers: ActionTimerMap,
    left: LivingCombatant,
    right: LivingCombatant,
  ): number {
    const leftTimer = timers[left.key] ?? 0;
    const rightTimer = timers[right.key] ?? 0;
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
