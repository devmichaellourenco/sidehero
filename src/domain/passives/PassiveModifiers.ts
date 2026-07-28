import { Hero } from '../entities/Hero';
import { CombatSkillDefinition } from '../progression/combat/CombatSkillDefinition';
import { isDamageCombatKind } from '../progression/combat/SkillCombatKind';
import { resolveHeroPassives } from './PassiveResolver';
import { ActivePassive, PassiveEffect } from './PassiveTypes';

function sumEffects(
  actives: readonly ActivePassive[],
  pick: (effect: PassiveEffect) => number | null,
): number {
  let total = 0;
  for (const active of actives) {
    for (const effect of active.definition.effects) {
      const value = pick(effect);
      if (value != null) total += value;
    }
  }
  return total;
}

export function isTreeDamageSkill(skill: CombatSkillDefinition): boolean {
  return isDamageCombatKind(skill.kind) && skill.skillId !== 'basic_attack';
}

export function isAllySupportSkill(skill: CombatSkillDefinition): boolean {
  return skill.kind === 'heal_ally' || skill.kind === 'buff_attack';
}

export function heroPassiveAttackPercent(hero: Hero): number {
  return sumEffects(resolveHeroPassives(hero), (effect) =>
    effect.kind === 'attack_percent_flat' ? effect.percent : null,
  );
}

export function heroPassiveDefensePercent(hero: Hero): number {
  return sumEffects(resolveHeroPassives(hero), (effect) =>
    effect.kind === 'defense_percent_flat' ? effect.percent : null,
  );
}

export function heroPassiveMaxHealthPercent(hero: Hero): number {
  const actives = resolveHeroPassives(hero);
  const flat = sumEffects(actives, (effect) =>
    effect.kind === 'max_health_percent_flat' ? effect.percent : null,
  );
  const perDefense = sumEffects(actives, (effect) =>
    effect.kind === 'max_health_percent_per_defense' ? effect.percentPerPoint : null,
  );
  const perLevel = sumEffects(actives, (effect) =>
    effect.kind === 'max_health_percent_per_level' ? effect.percentPerLevel : null,
  );

  return flat + perDefense * hero.defense + perLevel * hero.level;
}

export function heroPassiveTreeDamagePercent(hero: Hero, skill: CombatSkillDefinition): number {
  if (!isTreeDamageSkill(skill)) return 0;

  const actives = resolveHeroPassives(hero);
  const attrs = hero.totalAttributes;
  const flat = sumEffects(actives, (effect) =>
    effect.kind === 'tree_damage_percent_flat' ? effect.percent : null,
  );
  const perLevel = sumEffects(actives, (effect) =>
    effect.kind === 'tree_damage_percent_per_level' ? effect.percentPerLevel : null,
  );
  const perStr = sumEffects(actives, (effect) =>
    effect.kind === 'tree_damage_percent_per_str' ? effect.percentPerPoint : null,
  );
  const perInt = sumEffects(actives, (effect) =>
    effect.kind === 'tree_damage_percent_per_int' ? effect.percentPerPoint : null,
  );
  const perDex = sumEffects(actives, (effect) =>
    effect.kind === 'tree_damage_percent_per_dex' ? effect.percentPerPoint : null,
  );

  return (
    flat +
    perLevel * hero.level +
    perStr * attrs.str +
    perInt * attrs.int +
    perDex * attrs.dex
  );
}

export function heroPassiveAllySupportPercent(hero: Hero, skill: CombatSkillDefinition): number {
  if (!isAllySupportSkill(skill)) return 0;

  const actives = resolveHeroPassives(hero);
  const flat = sumEffects(actives, (effect) =>
    effect.kind === 'ally_support_percent_flat' ? effect.percent : null,
  );
  const perInt = sumEffects(actives, (effect) =>
    effect.kind === 'ally_support_percent_per_int' ? effect.percentPerPoint : null,
  );

  return flat + perInt * hero.totalAttributes.int;
}

export function applyPercentBonus(base: number, percentBonus: number): number {
  if (percentBonus === 0) return Math.max(1, Math.floor(base));
  return Math.max(1, Math.floor(base * (1 + percentBonus / 100)));
}

/** Resumo numérico curto para UI (uma linha). */
export function summarizeActivePassive(hero: Hero, active: ActivePassive): string {
  const parts: string[] = [];
  for (const effect of active.definition.effects) {
    switch (effect.kind) {
      case 'max_health_percent_per_defense':
        parts.push(
          `+${(effect.percentPerPoint * hero.defense).toFixed(0)}% vida (${effect.percentPerPoint}%×DEF ${hero.defense})`,
        );
        break;
      case 'tree_damage_percent_per_level':
        parts.push(
          `+${(effect.percentPerLevel * hero.level).toFixed(1)}% dano skills (${effect.percentPerLevel}%×Nv ${hero.level})`,
        );
        break;
      case 'ally_support_percent_per_int':
        parts.push(
          `+${(effect.percentPerPoint * hero.totalAttributes.int).toFixed(0)}% suporte (${effect.percentPerPoint}%×INT ${hero.totalAttributes.int})`,
        );
        break;
      case 'max_health_percent_per_level':
        parts.push(
          `+${(effect.percentPerLevel * hero.level).toFixed(1)}% vida (${effect.percentPerLevel}%×Nv ${hero.level})`,
        );
        break;
      case 'tree_damage_percent_per_str':
        parts.push(
          `+${(effect.percentPerPoint * hero.totalAttributes.str).toFixed(0)}% dano skills (${effect.percentPerPoint}%×FOR ${hero.totalAttributes.str})`,
        );
        break;
      case 'tree_damage_percent_per_int':
        parts.push(
          `+${(effect.percentPerPoint * hero.totalAttributes.int).toFixed(0)}% dano skills (${effect.percentPerPoint}%×INT ${hero.totalAttributes.int})`,
        );
        break;
      case 'tree_damage_percent_per_dex':
        parts.push(
          `+${(effect.percentPerPoint * hero.totalAttributes.dex).toFixed(0)}% dano skills (${effect.percentPerPoint}%×DES ${hero.totalAttributes.dex})`,
        );
        break;
      case 'attack_percent_flat':
        parts.push(`+${effect.percent}% ataque`);
        break;
      case 'defense_percent_flat':
        parts.push(`+${effect.percent}% defesa`);
        break;
      case 'max_health_percent_flat':
        parts.push(`+${effect.percent}% vida`);
        break;
      case 'ally_support_percent_flat':
        parts.push(`+${effect.percent}% suporte`);
        break;
      case 'tree_damage_percent_flat':
        parts.push(`+${effect.percent}% dano skills`);
        break;
    }
  }
  return parts.join(' · ');
}
