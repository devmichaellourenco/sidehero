import { Enemy, EnemyProps } from './Enemy';
import { Hero } from './Hero';
import { CombatantRef, TurnOrderService } from '../services/combat/TurnOrderService';
import {
  SkillCooldownMap,
  SkillCooldownTracker,
} from '../services/combat/SkillCooldownTracker';
import { StatusEffectMap } from '../services/combat/CombatStatusEffect';
import { EncounterMeta } from '../campaign/EncounterResolver';

export interface CombatStateProps {
  enemies: EnemyProps[];
  turnQueue: CombatantRef[];
  turnIndex: number;
  round: number;
  skillCooldowns: SkillCooldownMap;
  statusEffects: StatusEffectMap;
  encounterMeta: EncounterMeta | null;
}

export class CombatState {
  readonly enemies: Enemy[];
  readonly turnQueue: CombatantRef[];
  readonly turnIndex: number;
  readonly round: number;
  readonly skillCooldowns: SkillCooldownMap;
  readonly statusEffects: StatusEffectMap;
  readonly encounterMeta: EncounterMeta | null;

  private constructor(props: CombatStateProps) {
    this.enemies = props.enemies.map((enemy) => Enemy.restore(enemy));
    this.turnQueue = [...props.turnQueue];
    this.turnIndex = Math.max(0, props.turnIndex);
    this.round = Math.max(1, props.round);
    this.skillCooldowns = props.skillCooldowns ?? {};
    this.statusEffects = props.statusEffects ?? {};
    this.encounterMeta = props.encounterMeta ?? null;
  }

  static restore(props: CombatStateProps): CombatState {
    return new CombatState({
      ...props,
      skillCooldowns: props.skillCooldowns ?? {},
      statusEffects: props.statusEffects ?? {},
      encounterMeta: props.encounterMeta ?? null,
    });
  }

  static start(
    heroes: Hero[],
    enemies: Enemy[],
    turnOrder: TurnOrderService,
    encounterMeta: EncounterMeta | null = null,
  ): CombatState {
    return new CombatState({
      enemies: enemies.map((enemy) => enemy.toProps()),
      turnQueue: turnOrder.buildRoundOrder(heroes, enemies),
      turnIndex: 0,
      round: 1,
      skillCooldowns: SkillCooldownTracker.createInitial(heroes, enemies),
      statusEffects: {},
      encounterMeta,
    });
  }

  static fromLegacyEnemy(enemy: Enemy, heroes: Hero[], turnOrder: TurnOrderService): CombatState {
    return CombatState.start(heroes, [enemy], turnOrder);
  }

  currentActor(): CombatantRef | null {
    return this.turnQueue[this.turnIndex] ?? null;
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

  withSkillCooldowns(skillCooldowns: SkillCooldownMap): CombatState {
    return this.clone({ skillCooldowns });
  }

  withStatusEffects(statusEffects: StatusEffectMap): CombatState {
    return this.clone({ statusEffects });
  }

  advanceTurn(): CombatState {
    const nextIndex = this.turnIndex + 1;
    if (nextIndex >= this.turnQueue.length) {
      return this.clone({ turnIndex: 0, round: this.round + 1, turnQueue: [] });
    }
    return this.clone({ turnIndex: nextIndex });
  }

  needsNewRound(): boolean {
    return this.turnQueue.length === 0 || this.turnIndex >= this.turnQueue.length;
  }

  toProps(): CombatStateProps {
    return {
      enemies: this.enemies.map((enemy) => enemy.toProps()),
      turnQueue: this.turnQueue,
      turnIndex: this.turnIndex,
      round: this.round,
      skillCooldowns: structuredClone(this.skillCooldowns),
      statusEffects: structuredClone(this.statusEffects),
      encounterMeta: this.encounterMeta ? { ...this.encounterMeta } : null,
    };
  }

  private clone(partial: Partial<CombatStateProps>): CombatState {
    return new CombatState({ ...this.toProps(), ...partial });
  }
}
