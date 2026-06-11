import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { isStatusCombatKind } from '../../progression/combat/SkillCombatKind';
import { CombatAction } from './CombatAction';
import {
  CombatFloatingEvent,
  createDamageEvent,
  createHealEvent,
} from './CombatFloatingEvent';
import { Stats } from '../../value-objects/Stats';
import { CombatActionContext } from './CombatActionContext';
import {
  resolveEffectiveTargetDefense,
  resolveOutgoingDamage,
} from './CombatDamageResolver';
import { CombatStatusEffectTracker } from './CombatStatusEffectTracker';
import { StatusApplication } from './CombatStatusEffect';
import { combatantKey } from './SkillCooldownTracker';

export interface CombatExecutionResult {
  heroes: Hero[];
  enemies: Enemy[];
  event: string | null;
  floatingEvents: CombatFloatingEvent[];
  statusApplications: StatusApplication[];
}

export class CombatActionExecutor {
  execute(
    action: CombatAction,
    actorName: string,
    heroes: Hero[],
    enemies: Enemy[],
    statusEffects: CombatStatusEffectTracker = CombatStatusEffectTracker.fromMap({}),
    context?: CombatActionContext,
  ): CombatExecutionResult {
    if (action.power <= 0 && action.kind !== 'heal_ally' && !isStatusCombatKind(action.kind)) {
      return { heroes, enemies, event: null, floatingEvents: [], statusApplications: [] };
    }

    if (isStatusCombatKind(action.kind)) {
      return this.applyStatusEffect(action, actorName, heroes, enemies);
    }

    if (action.kind === 'heal_ally') {
      return this.applyHeal(action, actorName, heroes, enemies);
    }

    if (action.targeting === 'single_ally' || action.targeting === 'all_allies') {
      return this.applyHeroDamage(action, actorName, heroes, enemies, statusEffects, context);
    }

    return this.applyEnemyDamage(action, actorName, heroes, enemies, statusEffects, context);
  }

  private applyStatusEffect(
    action: CombatAction,
    actorName: string,
    heroes: Hero[],
    enemies: Enemy[],
  ): CombatExecutionResult {
    const targetKeys: Array<{ key: string; label: string }> = [];

    if (action.targeting === 'all_allies' || action.targeting === 'single_ally') {
      const targetIds =
        action.targeting === 'all_allies'
          ? (action.targetHeroIds ?? [])
          : action.targetHeroId
            ? [action.targetHeroId]
            : [];

      for (const heroId of targetIds) {
        const hero = heroes.find((entry) => entry.id === heroId);
        if (!hero?.isAlive()) continue;
        targetKeys.push({ key: combatantKey('hero', heroId), label: hero.name });
      }
    } else {
      const targetIds =
        action.targeting === 'all_enemies'
          ? (action.targetEnemyIds ?? [])
          : action.targetEnemyId
            ? [action.targetEnemyId]
            : [];

      for (const enemyId of targetIds) {
        const enemy = enemies.find((entry) => entry.id === enemyId);
        if (!enemy?.isAlive()) continue;
        targetKeys.push({ key: combatantKey('enemy', enemyId), label: enemy.name });
      }
    }

    if (targetKeys.length === 0) {
      return { heroes, enemies, event: null, floatingEvents: [], statusApplications: [] };
    }

    const duration = action.effectDurationTurns ?? 1;
    const statusApplications: StatusApplication[] = targetKeys.map((target) => ({
      combatantKey: target.key,
      skillId: action.skillId,
      kind: action.kind as StatusApplication['kind'],
      magnitude: action.power,
      durationTurns: duration,
      skillName: action.skillName,
    }));

    const statLabel =
      action.kind === 'buff_attack'
        ? `+${action.power} ATK`
        : `-${action.power} DEF`;
    const scope =
      targetKeys.length > 1
        ? `${targetKeys.length} alvos (${statLabel}, ${duration}t)`
        : `${statLabel}, ${duration}t`;
    const event = `${actorName} usou ${action.skillName} (${scope})`;

    return { heroes, enemies, event, floatingEvents: [], statusApplications };
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
      return { heroes, enemies, event: null, floatingEvents: [], statusApplications: [] };
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

    return {
      heroes: updatedHeroes,
      enemies,
      event,
      floatingEvents,
      statusApplications: [],
    };
  }

  private applyHeroDamage(
    action: CombatAction,
    actorName: string,
    heroes: Hero[],
    enemies: Enemy[],
    statusEffects: CombatStatusEffectTracker,
    context?: CombatActionContext,
  ): CombatExecutionResult {
    const targetIds =
      action.targeting === 'all_allies'
        ? (action.targetHeroIds ?? [])
        : action.targetHeroId
          ? [action.targetHeroId]
          : [];

    if (targetIds.length === 0) {
      return { heroes, enemies, event: null, floatingEvents: [], statusApplications: [] };
    }

    const floatingEvents: CombatFloatingEvent[] = [];
    let updatedHeroes = heroes;

    for (const heroId of targetIds) {
      const target = updatedHeroes.find((hero) => hero.id === heroId);
      if (!target || !target.isAlive()) continue;

      const beforeHealth = target.currentHealth;
      const heroKey = combatantKey('hero', heroId);
      const effectiveDefense = resolveEffectiveTargetDefense(
        target.defense,
        heroKey,
        statusEffects,
      );
      const resolved = this.resolveDamageAmount(action.power, effectiveDefense, context);
      updatedHeroes = updatedHeroes.map((hero) =>
        hero.id === heroId
          ? Hero.restore({
              ...hero.toProps(),
              currentHealth: Math.max(0, hero.currentHealth - resolved.amount),
            })
          : hero,
      );
      const damaged = updatedHeroes.find((hero) => hero.id === heroId)!;
      const damageEvent = createDamageEvent(
        'hero',
        heroId,
        beforeHealth,
        damaged.currentHealth,
        resolved.isCrit,
      );
      if (damageEvent) floatingEvents.push(damageEvent);
    }

    const dealt = floatingEvents.reduce((sum, entry) => sum + entry.amount, 0);
    const critTag = floatingEvents.some((entry) => entry.kind === 'crit') ? ' CRÍTICO!' : '';
    const scope =
      action.targeting === 'all_allies'
        ? `atingiu todos os heróis (${dealt})`
        : `causou ${dealt}`;
    const event = `${actorName} usou ${action.skillName} e ${scope}${critTag}`;

    return { heroes: updatedHeroes, enemies, event, floatingEvents, statusApplications: [] };
  }

  private applyEnemyDamage(
    action: CombatAction,
    actorName: string,
    heroes: Hero[],
    enemies: Enemy[],
    statusEffects: CombatStatusEffectTracker,
    context?: CombatActionContext,
  ): CombatExecutionResult {
    const targetIds =
      action.targeting === 'all_enemies'
        ? (action.targetEnemyIds ?? [])
        : action.targetEnemyId
          ? [action.targetEnemyId]
          : [];

    if (targetIds.length === 0) {
      return { heroes, enemies, event: null, floatingEvents: [], statusApplications: [] };
    }

    const floatingEvents: CombatFloatingEvent[] = [];
    let updatedEnemies = enemies;

    for (const enemyId of targetIds) {
      const target = updatedEnemies.find((enemy) => enemy.id === enemyId);
      if (!target || !target.isAlive()) continue;

      const beforeHealth = target.stats.currentHealth;
      const enemyKey = combatantKey('enemy', enemyId);
      const effectiveDefense = resolveEffectiveTargetDefense(
        target.stats.defense,
        enemyKey,
        statusEffects,
      );
      const resolved = this.resolveDamageAmount(
        action.power,
        effectiveDefense,
        context,
        target.stage,
      );
      const damaged = Enemy.restore({
        ...target.toProps(),
        stats: Stats.create({
          ...target.stats.toProps(),
          currentHealth: Math.max(0, target.stats.currentHealth - resolved.amount),
        }),
      });
      const damageEvent = createDamageEvent(
        'enemy',
        enemyId,
        beforeHealth,
        damaged.stats.currentHealth,
        resolved.isCrit,
      );
      if (damageEvent) floatingEvents.push(damageEvent);
      updatedEnemies = updatedEnemies.map((enemy) => (enemy.id === enemyId ? damaged : enemy));
    }

    const dealt = floatingEvents.reduce((sum, entry) => sum + entry.amount, 0);
    const critTag = floatingEvents.some((entry) => entry.kind === 'crit') ? ' CRÍTICO!' : '';
    const scope =
      action.targeting === 'all_enemies'
        ? `atingiu todos os inimigos (${dealt})`
        : `causou ${dealt}`;
    const verb = action.kind === 'damage_magic' ? 'lançou' : 'usou';
    const event =
      action.skillId === 'basic_attack'
        ? `${actorName} usou ${action.skillName} (${dealt} dano${critTag})`
        : `${actorName} ${verb} ${action.skillName} e ${scope}${critTag}`;

    return { heroes, enemies: updatedEnemies, event, floatingEvents, statusApplications: [] };
  }

  private resolveDamageAmount(
    rawPower: number,
    targetDefense: number,
    context?: CombatActionContext,
    targetStageLevel?: number,
  ): { amount: number; isCrit: boolean } {
    const stageLevel = targetStageLevel ?? context?.stageLevel ?? 1;
    const profile = context?.attackerProfile ?? {
      attackSpeed: 1,
      castSpeed: 1,
      critChance: 0,
      critDamage: 1.4,
    };

    return resolveOutgoingDamage(rawPower, targetDefense, stageLevel, profile, {
      rng: context?.rng,
    });
  }
}
