import { GameState } from '../../entities/GameState';
import { Enemy } from '../../entities/Enemy';
import { CombatTickResult, ICombatService } from '../ICombatService';
import { EnemyCounterPhase } from './EnemyCounterPhase';
import { HeroAttackPhase } from './HeroAttackPhase';
import { VictoryRewardPhase } from './VictoryRewardPhase';

export class CombatPipeline implements ICombatService {
  private readonly heroAttack = new HeroAttackPhase();
  private readonly enemyCounter = new EnemyCounterPhase();
  private readonly victoryReward = new VictoryRewardPhase();

  executeTick(state: GameState): CombatTickResult {
    if (!state.currentEnemy) {
      return {
        state: state.withEnemy(Enemy.forStage(state.stage)),
        events: ['Novo inimigo apareceu no painel!'],
      };
    }

    const heroes = [...state.heroes];
    const attackResult = this.heroAttack.execute(heroes, state.currentEnemy);
    const events = [...attackResult.events];

    if (attackResult.enemy.isAlive()) {
      const counterResult = this.enemyCounter.execute(state, attackResult.enemy, heroes);
      return {
        state: counterResult.state,
        events: [...events, ...counterResult.events],
      };
    }

    const victoryResult = this.victoryReward.execute(state, state.currentEnemy, heroes);
    return {
      state: victoryResult.state,
      events: [...events, ...victoryResult.events],
    };
  }
}
