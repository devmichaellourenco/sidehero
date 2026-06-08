import { CHEST_EVERY_N_WINS } from '../../constants/CombatRules';
import { GameState } from '../../entities/GameState';
import { Enemy } from '../../entities/Enemy';
import { Hero } from '../../entities/Hero';
import { Chest } from '../../entities/Chest';

export interface VictoryRewardPhaseResult {
  state: GameState;
  events: string[];
}

export class VictoryRewardPhase {
  execute(state: GameState, enemy: Enemy, heroes: Hero[]): VictoryRewardPhaseResult {
    const events: string[] = [];

    let nextState = state
      .withGold(state.gold.add(enemy.goldReward))
      .withHeroes(heroes.map((hero) => hero.gainExperience(enemy.xpReward)))
      .incrementBattlesWon()
      .addLog(`${enemy.name} derrotado! +${enemy.goldReward} ouro, +${enemy.xpReward} XP`);

    const newStage = state.stage + 1;
    nextState = nextState.withStage(newStage).withEnemy(Enemy.forStage(newStage));

    if (nextState.totalBattlesWon % CHEST_EVERY_N_WINS === 0) {
      const chest = Chest.create(state.stage);
      nextState = nextState
        .withChests([...nextState.chests, chest])
        .addLog('📦 Baú dropou no painel!');
      events.push('Baú obtido!');
    }

    return { state: nextState.touchTick(), events };
  }
}
