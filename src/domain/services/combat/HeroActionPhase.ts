import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { CombatActionExecutor } from './CombatActionExecutor';
import { CombatFloatingEvent } from './CombatFloatingEvent';
import { ICombatSkillResolver } from './ICombatSkillResolver';
import { CombatSkillResolver } from './CombatSkillResolver';

export interface HeroActionPhaseResult {
  heroes: Hero[];
  enemy: Enemy;
  events: string[];
  floatingEvents: CombatFloatingEvent[];
}

export class HeroActionPhase {
  constructor(
    private readonly skillResolver: ICombatSkillResolver = new CombatSkillResolver(),
    private readonly actionExecutor = new CombatActionExecutor(),
  ) {}

  execute(heroes: Hero[], enemy: Enemy): HeroActionPhaseResult {
    const events: string[] = [];
    const floatingEvents: CombatFloatingEvent[] = [];
    let party = [...heroes];
    let currentEnemy = enemy;

    for (const hero of party) {
      if (!currentEnemy.isAlive()) break;
      if (!hero.isAlive()) continue;

      const action = this.skillResolver.resolve(hero, party);
      const result = this.actionExecutor.execute(action, hero, party, currentEnemy);

      party = result.heroes;
      currentEnemy = result.enemy;
      if (result.event) {
        events.push(result.event);
      }
      floatingEvents.push(...result.floatingEvents);
    }

    return { heroes: party, enemy: currentEnemy, events, floatingEvents };
  }
}
