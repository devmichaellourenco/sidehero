import { GameState } from '../../entities/GameState';
import { Enemy } from '../../entities/Enemy';
import { Hero } from '../../entities/Hero';
import { CombatFloatingEvent, createDamageEvent } from './CombatFloatingEvent';

export interface EnemyCounterPhaseResult {
  state: GameState;
  events: string[];
  floatingEvents: CombatFloatingEvent[];
  partyWiped: boolean;
}

export class EnemyCounterPhase {
  execute(state: GameState, enemy: Enemy, heroes: Hero[]): EnemyCounterPhaseResult {
    const events: string[] = [];
    const floatingEvents: CombatFloatingEvent[] = [];
    const totalDefense = heroes.reduce((sum, hero) => sum + hero.defense, 0);
    const enemyDamage = Math.max(3, enemy.stats.attack - Math.floor(totalDefense / 3));
    const damagedHeroes = heroes.map((hero) => {
      const beforeHealth = hero.currentHealth;
      const damaged = hero.takeDamage(enemyDamage);
      const damageEvent = createDamageEvent('hero', hero.id, beforeHealth, damaged.currentHealth);
      if (damageEvent) {
        floatingEvents.push(damageEvent);
      }
      return damaged;
    });

    events.push(`${enemy.name} contra-atacou (${enemyDamage} dano)`);

    const aliveHeroes = damagedHeroes.filter((hero) => hero.isAlive());
    if (aliveHeroes.length === 0) {
      const recovered = state.heroes.map((hero) => hero.healFull());
      return {
        state: state
          .withHeroes(recovered)
          .withEnemy(Enemy.forStage(state.stage))
          .addLog([...events, 'Party derrotada! Recuperando no painel...'].join(' · ')),
        events: [...events, 'Party derrotada! Recuperando no painel...'],
        floatingEvents,
        partyWiped: true,
      };
    }

    return {
      state: state.withHeroes(damagedHeroes).withEnemy(enemy).addLog(events.join(' · ')).touchTick(),
      events,
      floatingEvents,
      partyWiped: false,
    };
  }
}
