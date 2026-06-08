import { CHEST_EVERY_N_WINS } from '../constants/CombatRules';
import { GameState } from '../entities/GameState';
import { Enemy } from '../entities/Enemy';
import { Chest } from '../entities/Chest';

export interface CombatTickResult {
  state: GameState;
  events: string[];
}

export class CombatService {
  executeTick(state: GameState): CombatTickResult {
    if (!state.currentEnemy) {
      return {
        state: state.withEnemy(Enemy.forStage(state.stage)),
        events: ['Novo inimigo apareceu no painel!'],
      };
    }

    const events: string[] = [];
    let enemy = state.currentEnemy;
    let heroes = [...state.heroes];

    for (let i = 0; i < heroes.length; i++) {
      const hero = heroes[i];
      if (!enemy.isAlive()) break;

      const damage = hero.attack;
      enemy = enemy.takeDamage(damage);
      events.push(`${hero.name} atacou por ${damage} de dano`);
    }

    if (enemy.isAlive()) {
      const totalDefense = heroes.reduce((sum, h) => sum + h.defense, 0);
      const enemyDamage = Math.max(3, enemy.stats.attack - Math.floor(totalDefense / 3));

      heroes = heroes.map((hero) => hero.takeDamage(enemyDamage));

      events.push(`${enemy.name} contra-atacou (${enemyDamage} dano)`);

      const aliveHeroes = heroes.filter((h) => h.isAlive());
      if (aliveHeroes.length === 0) {
        heroes = state.heroes.map((h) => h.healFull());
        events.push('Party derrotada! Recuperando no painel...');
        return {
          state: state
            .withHeroes(heroes)
            .withEnemy(Enemy.forStage(state.stage))
            .addLog(events.join(' · ')),
          events,
        };
      }

      return {
        state: state
          .withHeroes(heroes)
          .withEnemy(enemy)
          .addLog(events.join(' · '))
          .touchTick(),
        events,
      };
    }

    let nextState = state
      .withGold(state.gold.add(enemy.goldReward))
      .withHeroes(
        heroes.map((h) => h.gainExperience(enemy.xpReward)),
      )
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

    return {
      state: nextState.touchTick(),
      events,
    };
  }
}
