import { GameState } from '../../entities/GameState';
import { Enemy } from '../../entities/Enemy';
import { CombatTickResult, ICombatService } from '../ICombatService';
import { EnemyCounterPhase } from './EnemyCounterPhase';
import { HeroActionPhase } from './HeroActionPhase';
import { VictoryRewardPhase } from './VictoryRewardPhase';

export class CombatPipeline implements ICombatService {
  constructor(
    private readonly heroAction = new HeroActionPhase(),
    private readonly enemyCounter = new EnemyCounterPhase(),
    private readonly victoryReward = new VictoryRewardPhase(),
  ) {}

  executeTick(state: GameState): CombatTickResult {
    if (!state.currentEnemy) {
      return {
        state: state.withEnemy(Enemy.forStage(state.stage)),
        events: ['Novo inimigo apareceu no painel!'],
        floatingEvents: [],
      };
    }

    const actionResult = this.heroAction.execute(state.heroes, state.currentEnemy);
    const events = [...actionResult.events];
    const floatingEvents = [...actionResult.floatingEvents];

    if (actionResult.enemy.isAlive()) {
      const counterResult = this.enemyCounter.execute(
        state,
        actionResult.enemy,
        actionResult.heroes,
      );
      return {
        state: counterResult.state,
        events: [...events, ...counterResult.events],
        floatingEvents: [...floatingEvents, ...counterResult.floatingEvents],
      };
    }

    const victoryResult = this.victoryReward.execute(
      state,
      state.currentEnemy,
      actionResult.heroes,
    );

    return {
      state: victoryResult.state,
      events: [...events, ...victoryResult.events],
      floatingEvents,
    };
  }
}
