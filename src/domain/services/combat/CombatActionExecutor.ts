import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { CombatAction } from './CombatAction';

export interface CombatActionResult {
  heroes: Hero[];
  enemy: Enemy;
  event: string | null;
}

export class CombatActionExecutor {
  execute(action: CombatAction, hero: Hero, party: Hero[], enemy: Enemy): CombatActionResult {
    if (action.power <= 0 && action.kind !== 'heal_ally') {
      return { heroes: party, enemy, event: null };
    }

    switch (action.kind) {
      case 'heal_ally': {
        if (!action.targetHeroId) {
          return { heroes: party, enemy, event: null };
        }

        const heroes = party.map((ally) =>
          ally.id === action.targetHeroId ? ally.heal(action.power) : ally,
        );
        const target = heroes.find((ally) => ally.id === action.targetHeroId);
        const label = action.skillName ?? 'Cura';
        const event = target
          ? `${hero.name} usou ${label} em ${target.name} (+${action.power} HP)`
          : null;

        return { heroes, enemy, event };
      }

      case 'damage_magic':
      case 'damage_physical': {
        const updatedEnemy = enemy.takeDamage(action.power);
        const verb = action.kind === 'damage_magic' ? 'lançou' : 'usou';
        const label = action.skillName ?? 'Ataque';
        const event = `${hero.name} ${verb} ${label} (${action.power})`;

        return { heroes: party, enemy: updatedEnemy, event };
      }

      case 'basic_attack': {
        const updatedEnemy = enemy.takeDamage(action.power);
        const event = `${hero.name} atacou por ${action.power} de dano`;
        return { heroes: party, enemy: updatedEnemy, event };
      }

      default:
        return { heroes: party, enemy, event: null };
    }
  }
}
