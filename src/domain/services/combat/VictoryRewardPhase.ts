import { CHEST_EVERY_N_WINS } from '../../constants/CombatRules';
import { GameState } from '../../entities/GameState';
import { Enemy } from '../../entities/Enemy';
import { Hero } from '../../entities/Hero';
import { Chest } from '../../entities/Chest';
import { CombatState } from '../../entities/CombatState';
import { TurnOrderService } from './TurnOrderService';
import { spawnEncounterForStage } from './EncounterSpawner';

export interface VictoryRewardPhaseResult {
  state: GameState;
  events: string[];
}

export class VictoryRewardPhase {
  constructor(private readonly turnOrder = new TurnOrderService()) {}

  execute(state: GameState, defeatedEnemies: Enemy[], heroes: Hero[]): VictoryRewardPhaseResult {
    const events: string[] = [];
    const totalGold = defeatedEnemies.reduce((sum, enemy) => sum + enemy.goldReward, 0);
    const totalXp = defeatedEnemies.reduce((sum, enemy) => sum + enemy.xpReward, 0);
    const enemyNames = defeatedEnemies.map((enemy) => enemy.name).join(', ');

    let nextState = state
      .withGold(state.gold.add(totalGold))
      .withHeroes(heroes.map((hero) => hero.gainExperience(totalXp)))
      .incrementBattlesWon()
      .addLog(`${enemyNames} derrotado(s)! +${totalGold} ouro, +${totalXp} XP`);

    const newStage = state.stage + 1;
    const nextEnemies = spawnEncounterForStage(newStage);
    const nextCombat = CombatState.start(nextState.heroes, nextEnemies, this.turnOrder);

    nextState = nextState.withStage(newStage).withCombat(nextCombat);

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
