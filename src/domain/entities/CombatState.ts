import { Enemy, EnemyProps } from './Enemy';
import { Hero } from './Hero';
import { ActionTimerMap, ActionTimerService } from '../services/combat/ActionTimerService';
import {
  SkillCooldownMap,
  SkillCooldownTracker,
} from '../services/combat/SkillCooldownTracker';
import { CombatantRef } from '../services/combat/TurnOrderService';
import { StatusEffectMap } from '../services/combat/CombatStatusEffect';
import { EncounterMeta } from '../campaign/EncounterResolver';

export interface CombatStateProps {
  enemies: EnemyProps[];
  actionTimers: ActionTimerMap;
  combatTime: number;
  skillCooldowns: SkillCooldownMap;
  statusEffects: StatusEffectMap;
  encounterMeta: EncounterMeta | null;
  /** Legado — ignorado após migração temporal. */
  turnQueue?: CombatantRef[];
  turnIndex?: number;
  round?: number;
}

export class CombatState {
  readonly enemies: Enemy[];
  readonly actionTimers: ActionTimerMap;
  readonly combatTime: number;
  readonly skillCooldowns: SkillCooldownMap;
  readonly statusEffects: StatusEffectMap;
  readonly encounterMeta: EncounterMeta | null;

  private constructor(props: CombatStateProps) {
    this.enemies = props.enemies.map((enemy) => Enemy.restore(enemy));
    this.actionTimers = { ...(props.actionTimers ?? {}) };
    this.combatTime = Math.max(0, props.combatTime ?? 0);
    this.skillCooldowns = props.skillCooldowns ?? {};
    this.statusEffects = props.statusEffects ?? {};
    this.encounterMeta = props.encounterMeta ?? null;
  }

  static restore(props: CombatStateProps): CombatState {
    return new CombatState({
      ...props,
      actionTimers: props.actionTimers ?? {},
      combatTime: props.combatTime ?? 0,
      skillCooldowns: props.skillCooldowns ?? {},
      statusEffects: props.statusEffects ?? {},
      encounterMeta: props.encounterMeta ?? null,
    });
  }

  static start(
    heroes: Hero[],
    enemies: Enemy[],
    actionTimers = new ActionTimerService(),
    encounterMeta: EncounterMeta | null = null,
  ): CombatState {
    return new CombatState({
      enemies: enemies.map((enemy) => enemy.toProps()),
      actionTimers: actionTimers.createInitial(heroes, enemies),
      combatTime: 0,
      skillCooldowns: SkillCooldownTracker.createInitial(heroes, enemies),
      statusEffects: {},
      encounterMeta,
    });
  }

  static fromLegacyEnemy(
    enemy: Enemy,
    heroes: Hero[],
    actionTimers = new ActionTimerService(),
  ): CombatState {
    return CombatState.start(heroes, [enemy], actionTimers);
  }

  /** Combatente com ação mais atrasada (próximo a agir). */
  peekNextActor(heroes: Hero[], enemies: Enemy[]): CombatantRef | null {
    const service = new ActionTimerService();
    const resolved = service.resolveNextActor(this.actionTimers, heroes, enemies);
    return resolved.actor;
  }

  get round(): number {
    return Math.floor(this.combatTime / 8) + 1;
  }

  findEnemy(enemyId: string): Enemy | undefined {
    return this.enemies.find((enemy) => enemy.id === enemyId);
  }

  livingEnemies(): Enemy[] {
    return this.enemies.filter((enemy) => enemy.isAlive());
  }

  withEnemies(enemies: Enemy[]): CombatState {
    return this.clone({ enemies: enemies.map((enemy) => enemy.toProps()) });
  }

  withActionTimers(actionTimers: ActionTimerMap): CombatState {
    return this.clone({ actionTimers });
  }

  withCombatTime(combatTime: number): CombatState {
    return this.clone({ combatTime });
  }

  withSkillCooldowns(skillCooldowns: SkillCooldownMap): CombatState {
    return this.clone({ skillCooldowns });
  }

  withStatusEffects(statusEffects: StatusEffectMap): CombatState {
    return this.clone({ statusEffects });
  }

  toProps(): CombatStateProps {
    return {
      enemies: this.enemies.map((enemy) => enemy.toProps()),
      actionTimers: structuredClone(this.actionTimers),
      combatTime: this.combatTime,
      skillCooldowns: structuredClone(this.skillCooldowns),
      statusEffects: structuredClone(this.statusEffects),
      encounterMeta: this.encounterMeta ? { ...this.encounterMeta } : null,
    };
  }

  private clone(partial: Partial<CombatStateProps>): CombatState {
    return new CombatState({ ...this.toProps(), ...partial });
  }
}
