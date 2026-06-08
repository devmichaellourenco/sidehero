import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { CombatAction } from './CombatAction';
import {
  CombatFloatingEvent,
  createDamageEvent,
  createHealEvent,
} from './CombatFloatingEvent';

export interface CombatExecutionResult {
  heroes: Hero[];
  enemies: Enemy[];
  event: string | null;
  floatingEvents: CombatFloatingEvent[];
}

export class CombatActionExecutor {
  execute(
    action: CombatAction,
    actorName: string,
    heroes: Hero[],
    enemies: Enemy[],
  ): CombatExecutionResult {
    if (action.power <= 0 && action.kind !== 'heal_ally') {
      return { heroes, enemies, event: null, floatingEvents: [] };
    }

    if (action.kind === 'heal_ally') {
      return this.applyHeal(action, actorName, heroes, enemies);
    }

    if (action.targeting === 'single_ally' || action.targeting === 'all_allies') {
      return this.applyHeroDamage(action, actorName, heroes, enemies);
    }

    return this.applyEnemyDamage(action, actorName, heroes, enemies);
  }

  private applyHeal(
    action: CombatAction,
    actorName: string,
    heroes: Hero[],
    enemies: Enemy[],
  ): CombatExecutionResult {
    const targetIds =
      action.targeting === 'all_allies'
        ? (action.targetHeroIds ?? [])
        : action.targetHeroId
          ? [action.targetHeroId]
          : [];

    if (targetIds.length === 0) {
      return { heroes, enemies, event: null, floatingEvents: [] };
    }

    const floatingEvents: CombatFloatingEvent[] = [];
    let updatedHeroes = heroes;

    for (const heroId of targetIds) {
      const target = updatedHeroes.find((hero) => hero.id === heroId);
      if (!target || !target.isAlive()) continue;

      const beforeHealth = target.currentHealth;
      updatedHeroes = updatedHeroes.map((hero) =>
        hero.id === heroId ? hero.heal(action.power) : hero,
      );
      const healed = updatedHeroes.find((hero) => hero.id === heroId)!;
      const healEvent = createHealEvent(heroId, beforeHealth, healed.currentHealth);
      if (healEvent) floatingEvents.push(healEvent);
    }

    const healedAmount = floatingEvents.reduce((sum, entry) => sum + entry.amount, 0);
    const scope =
      action.targeting === 'all_allies'
        ? `curou todos os aliados (+${healedAmount} HP total)`
        : `(+${healedAmount} HP)`;
    const event = `${actorName} usou ${action.skillName} ${scope}`;

    return { heroes: updatedHeroes, enemies, event, floatingEvents };
  }

  private applyHeroDamage(
    action: CombatAction,
    actorName: string,
    heroes: Hero[],
    enemies: Enemy[],
  ): CombatExecutionResult {
    const targetIds =
      action.targeting === 'all_allies'
        ? (action.targetHeroIds ?? [])
        : action.targetHeroId
          ? [action.targetHeroId]
          : [];

    if (targetIds.length === 0) {
      return { heroes, enemies, event: null, floatingEvents: [] };
    }

    const floatingEvents: CombatFloatingEvent[] = [];
    let updatedHeroes = heroes;

    for (const heroId of targetIds) {
      const target = updatedHeroes.find((hero) => hero.id === heroId);
      if (!target || !target.isAlive()) continue;

      const beforeHealth = target.currentHealth;
      updatedHeroes = updatedHeroes.map((hero) =>
        hero.id === heroId ? hero.takeDamage(action.power) : hero,
      );
      const damaged = updatedHeroes.find((hero) => hero.id === heroId)!;
      const damageEvent = createDamageEvent('hero', heroId, beforeHealth, damaged.currentHealth);
      if (damageEvent) floatingEvents.push(damageEvent);
    }

    const dealt = floatingEvents.reduce((sum, entry) => sum + entry.amount, 0);
    const scope =
      action.targeting === 'all_allies'
        ? `atingiu todos os heróis (${dealt})`
        : `causou ${dealt}`;
    const event = `${actorName} usou ${action.skillName} e ${scope}`;

    return { heroes: updatedHeroes, enemies, event, floatingEvents };
  }

  private applyEnemyDamage(
    action: CombatAction,
    actorName: string,
    heroes: Hero[],
    enemies: Enemy[],
  ): CombatExecutionResult {
    const targetIds =
      action.targeting === 'all_enemies'
        ? (action.targetEnemyIds ?? [])
        : action.targetEnemyId
          ? [action.targetEnemyId]
          : [];

    if (targetIds.length === 0) {
      return { heroes, enemies, event: null, floatingEvents: [] };
    }

    const floatingEvents: CombatFloatingEvent[] = [];
    let updatedEnemies = enemies;

    for (const enemyId of targetIds) {
      const target = updatedEnemies.find((enemy) => enemy.id === enemyId);
      if (!target || !target.isAlive()) continue;

      const beforeHealth = target.stats.currentHealth;
      const damaged = target.takeDamage(action.power);
      const damageEvent = createDamageEvent('enemy', enemyId, beforeHealth, damaged.stats.currentHealth);
      if (damageEvent) floatingEvents.push(damageEvent);
      updatedEnemies = updatedEnemies.map((enemy) => (enemy.id === enemyId ? damaged : enemy));
    }

    const dealt = floatingEvents.reduce((sum, entry) => sum + entry.amount, 0);
    const scope =
      action.targeting === 'all_enemies'
        ? `atingiu todos os inimigos (${dealt})`
        : `causou ${dealt}`;
    const verb = action.kind === 'damage_magic' ? 'lançou' : 'usou';
    const event =
      action.skillId === 'basic_attack'
        ? `${actorName} usou ${action.skillName} (${dealt} dano)`
        : `${actorName} ${verb} ${action.skillName} e ${scope}`;

    return { heroes, enemies: updatedEnemies, event, floatingEvents };
  }
}
