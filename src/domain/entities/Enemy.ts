import { Stats } from '../value-objects/Stats';
import { EnemyType, enemyNameForStage, enemyTypeForStage } from './EnemyType';

export interface EnemyProps {
  id: string;
  name: string;
  enemyType: EnemyType;
  stage: number;
  stats: Stats;
  goldReward: number;
  xpReward: number;
}

export class Enemy {
  readonly id: string;
  readonly name: string;
  readonly enemyType: EnemyType;
  readonly stage: number;
  readonly stats: Stats;
  readonly goldReward: number;
  readonly xpReward: number;

  private constructor(props: EnemyProps) {
    this.id = props.id;
    this.name = props.name;
    this.enemyType = props.enemyType;
    this.stage = props.stage;
    this.stats = props.stats;
    this.goldReward = props.goldReward;
    this.xpReward = props.xpReward;
  }

  static restore(props: EnemyProps): Enemy {
    return new Enemy(props);
  }

  static forStage(stage: number): Enemy {
    const scale = 1 + (stage - 1) * 0.15;

    return new Enemy({
      id: `enemy-${stage}-${Date.now()}`,
      name: enemyNameForStage(stage),
      enemyType: enemyTypeForStage(stage),
      stage,
      stats: Stats.fromBase(
        Math.floor(10 * scale),
        Math.floor(4 * scale),
        Math.floor(60 * scale),
      ),
      goldReward: Math.floor(8 * scale),
      xpReward: Math.floor(15 * scale),
    });
  }

  takeDamage(rawDamage: number): Enemy {
    return new Enemy({
      ...this.toProps(),
      stats: this.stats.takeDamage(rawDamage),
    });
  }

  isAlive(): boolean {
    return this.stats.isAlive();
  }

  toProps(): EnemyProps {
    return {
      id: this.id,
      name: this.name,
      enemyType: this.enemyType,
      stage: this.stage,
      stats: this.stats,
      goldReward: this.goldReward,
      xpReward: this.xpReward,
    };
  }
}
