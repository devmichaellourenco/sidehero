import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';

export interface HeroAttackPhaseResult {
  enemy: Enemy;
  events: string[];
}

export class HeroAttackPhase {
  execute(heroes: Hero[], enemy: Enemy): HeroAttackPhaseResult {
    const events: string[] = [];
    let currentEnemy = enemy;

    for (const hero of heroes) {
      if (!currentEnemy.isAlive()) break;

      const damage = hero.attack;
      currentEnemy = currentEnemy.takeDamage(damage);
      events.push(`${hero.name} atacou por ${damage} de dano`);
    }

    return { enemy: currentEnemy, events };
  }
}
