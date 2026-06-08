import { Enemy } from '../../entities/Enemy';
import { Hero } from '../../entities/Hero';
import {
  CombatSkillDefinition,
  SkillTargetPriority,
} from '../../progression/combat/CombatSkillDefinition';

export class SkillTargetResolver {
  resolveHeroTargets(
    definition: CombatSkillDefinition,
    party: Hero[],
    actorId: string,
  ): string[] {
    const living = party.filter((hero) => hero.isAlive());
    if (living.length === 0) return [];

    if (definition.targetScope === 'all') {
      return living.map((hero) => hero.id);
    }

    const target = this.pickHero(living, definition.targetPriority, actorId);
    return target ? [target.id] : [];
  }

  resolveEnemyTargets(definition: CombatSkillDefinition, enemies: Enemy[]): string[] {
    const living = enemies.filter((enemy) => enemy.isAlive());
    if (living.length === 0) return [];

    if (definition.targetScope === 'all') {
      return living.map((enemy) => enemy.id);
    }

    const target = this.pickEnemy(living, definition.targetPriority);
    return target ? [target.id] : [];
  }

  private pickHero(heroes: Hero[], priority: SkillTargetPriority, actorId: string): Hero | null {
    switch (priority) {
      case 'lowest_hp':
        return this.sortBy(heroes, (hero) => hero.currentHealth)[0] ?? null;
      case 'lowest_hp_percent':
        return this.sortBy(heroes, (hero) => hero.currentHealth / hero.maxHealth)[0] ?? null;
      case 'highest_hp':
        return this.sortBy(heroes, (hero) => -hero.currentHealth)[0] ?? null;
      case 'highest_hp_percent':
        return this.sortBy(heroes, (hero) => -(hero.currentHealth / hero.maxHealth))[0] ?? null;
      default:
        return heroes.find((hero) => hero.id === actorId) ?? heroes[0] ?? null;
    }
  }

  private pickEnemy(enemies: Enemy[], priority: SkillTargetPriority): Enemy | null {
    switch (priority) {
      case 'lowest_hp':
        return this.sortBy(enemies, (enemy) => enemy.stats.currentHealth)[0] ?? null;
      case 'lowest_hp_percent':
        return this.sortBy(
          enemies,
          (enemy) => enemy.stats.currentHealth / enemy.stats.maxHealth,
        )[0] ?? null;
      case 'highest_hp':
        return this.sortBy(enemies, (enemy) => -enemy.stats.currentHealth)[0] ?? null;
      case 'highest_hp_percent':
        return this.sortBy(
          enemies,
          (enemy) => -(enemy.stats.currentHealth / enemy.stats.maxHealth),
        )[0] ?? null;
      default:
        return enemies[0] ?? null;
    }
  }

  private sortBy<T>(items: T[], score: (item: T) => number): T[] {
    return [...items].sort((left, right) => score(left) - score(right));
  }
}
