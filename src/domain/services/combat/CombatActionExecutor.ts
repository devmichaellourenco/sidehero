import { dominantDamageElement, normalizeDamageComponents } from '../../combat/DamageComponent';
import { DAMAGE_ELEMENT_LABELS } from '../../combat/DamageElement';
import { DefensiveMitigation, ZERO_DEFENSIVE } from '../../combat/DefensiveMitigation';
import { defensiveMitigationForEnemy, defensiveMitigationForHero } from '../../combat/HeroDefensiveStatsProvider';
import { resistanceProfileFromHeroEquipment } from '../../combat/ResistanceProfileAggregator';
import { ResistanceProfile } from '../../combat/ResistanceProfile';
import { resolveEnemyInnateResists } from '../../enemies/EnemyInnateResists';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { isStatusCombatKind } from '../../progression/combat/SkillCombatKind';
import { CombatAction } from './CombatAction';
import {
  CombatFloatingEvent,
  createDamageEvent,
  createHealEvent,
  createStatusImpactEvent,
} from './CombatFloatingEvent';
import { Stats } from '../../value-objects/Stats';
import { CombatActionContext } from './CombatActionContext';
import {
  buildMitigationTarget,
  ResolvedDamage,
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
    const impactKind = action.kind === 'buff_attack' ? 'buff' : 'debuff';
    const floatingEvents: CombatFloatingEvent[] = [];

    const statusApplications: StatusApplication[] = targetKeys.map((target) => {
      const [, combatantId] = target.key.split(':');
      const side = target.key.startsWith('hero:') ? 'hero' : 'enemy';
      floatingEvents.push(
        createStatusImpactEvent(side, combatantId, impactKind, action.power),
      );

      return {
        combatantKey: target.key,
        skillId: action.skillId,
        kind: action.kind as StatusApplication['kind'],
        magnitude: action.power,
        durationTurns: duration,
        skillName: action.skillName,
      };
    });

    const statLabel =
      action.kind === 'buff_attack'
        ? `+${action.power} ATK`
        : `-${action.power} DEF`;
    const scope =
      targetKeys.length > 1
        ? `${targetKeys.length} alvos (${statLabel}, ${duration}t)`
        : `${statLabel}, ${duration}t`;
    const event = `${actorName} usou ${action.skillName} (${scope})`;

    return { heroes, enemies, event, floatingEvents, statusApplications };
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
    const statusApplications: StatusApplication[] = [];
    let dodgedAny = false;
    let blockedAny = false;

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
      const resolved = this.resolveDamageAmount(
        action.power,
        effectiveDefense,
        context,
        undefined,
        action.damageComponents,
        resistanceProfileFromHeroEquipment(target.toProps().equipment),
        defensiveMitigationForHero(target),
      );

      if (resolved.dodged) dodgedAny = true;
      if (resolved.blocked) blockedAny = true;

      if (!resolved.dodged) {
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
          dominantDamageElement(action.damageComponents),
        );
        if (damageEvent) floatingEvents.push(damageEvent);
      }

      statusApplications.push(
        ...this.collectOnHitDot(action, heroKey, resolved, context),
      );
    }

    const dealt = floatingEvents.reduce((sum, entry) => sum + entry.amount, 0);
    const mitigationTag = dodgedAny ? ' (ESQUIVOU!)' : blockedAny ? ' (bloqueio)' : '';
    const critTag = floatingEvents.some((entry) => entry.kind === 'crit') ? ' CRÍTICO!' : '';
    const scope =
      action.targeting === 'all_allies'
        ? `atingiu todos os heróis (${dealt})`
        : dealt > 0
          ? `causou ${dealt}`
          : 'não causou dano';
    const event = `${actorName} usou ${action.skillName} e ${scope}${mitigationTag}${critTag}`;

    return { heroes: updatedHeroes, enemies, event, floatingEvents, statusApplications };
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
    const statusApplications: StatusApplication[] = [];
    let dodgedAny = false;
    let blockedAny = false;

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
        action.damageComponents,
        resolveEnemyInnateResists(target.enemyType, target.stage),
        defensiveMitigationForEnemy(target),
      );

      if (resolved.dodged) dodgedAny = true;
      if (resolved.blocked) blockedAny = true;

      if (!resolved.dodged) {
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
          dominantDamageElement(action.damageComponents),
        );
        if (damageEvent) floatingEvents.push(damageEvent);
        updatedEnemies = updatedEnemies.map((enemy) => (enemy.id === enemyId ? damaged : enemy));
      }

      statusApplications.push(
        ...this.collectOnHitDot(action, enemyKey, resolved, context),
      );
    }

    const dealt = floatingEvents.reduce((sum, entry) => sum + entry.amount, 0);
    const mitigationTag = dodgedAny ? ' (ESQUIVOU!)' : blockedAny ? ' (bloqueio)' : '';
    const critTag = floatingEvents.some((entry) => entry.kind === 'crit') ? ' CRÍTICO!' : '';
    const scope =
      action.targeting === 'all_enemies'
        ? `atingiu todos os inimigos (${dealt})`
        : dealt > 0
          ? `causou ${dealt}`
          : 'não causou dano';
    const verb = formatDamageVerb(action);
    const elementTag = formatElementTag(action);
    const event =
      action.skillId === 'basic_attack'
        ? `${actorName} usou ${action.skillName} (${dealt} dano${mitigationTag}${critTag})`
        : `${actorName} ${verb} ${action.skillName}${elementTag} e ${scope}${mitigationTag}${critTag}`;

    return { heroes, enemies: updatedEnemies, event, floatingEvents, statusApplications };
  }

  private resolveDamageAmount(
    rawPower: number,
    targetDefense: number,
    context?: CombatActionContext,
    targetStageLevel?: number,
    damageComponents?: CombatAction['damageComponents'],
    targetResistances?: ResistanceProfile,
    defensive: DefensiveMitigation = ZERO_DEFENSIVE,
  ): ResolvedDamage {
    const stageLevel = targetStageLevel ?? context?.stageLevel ?? 1;
    const profile = context?.attackerProfile ?? {
      attackSpeed: 1,
      castSpeed: 1,
      critChance: 0,
      critDamage: 1.4,
    };
    const components = normalizeDamageComponents(
      damageComponents ?? [{ element: 'physical', delivery: 'melee', weight: 1 }],
    );

    return resolveOutgoingDamage(
      rawPower,
      components,
      buildMitigationTarget(targetDefense, stageLevel, targetResistances, defensive),
      profile,
      { rng: context?.rng },
    );
  }

  private collectOnHitDot(
    action: CombatAction,
    targetKey: string,
    resolved: ResolvedDamage,
    context?: CombatActionContext,
  ): StatusApplication[] {
    if (!action.onHitDot || resolved.dodged || resolved.amount <= 0) {
      return [];
    }

    const chance = action.onHitDot.applyChance ?? 1;
    const rng = context?.rng ?? Math.random;
    if (rng() >= chance) {
      return [];
    }

    return [
      {
        combatantKey: targetKey,
        skillId: action.skillId,
        kind: 'dot',
        magnitude: action.onHitDot.damagePerTurn,
        durationTurns: action.onHitDot.durationTurns,
        skillName: action.skillName,
        dotElement: action.onHitDot.element,
      },
    ];
  }
}

function formatDamageVerb(action: CombatAction): string {
  const primary = action.damageComponents?.[0]?.element;
  if (!primary || primary === 'physical') {
    return 'usou';
  }
  return 'lançou';
}

function formatElementTag(action: CombatAction): string {
  const components = action.damageComponents;
  if (!components?.length) return '';

  const labels = [...new Set(components.map((entry) => DAMAGE_ELEMENT_LABELS[entry.element]))];
  return labels.length === 1 ? ` (${labels[0]})` : ` (${labels.join(' + ')})`;
}
