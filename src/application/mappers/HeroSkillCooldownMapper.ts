import { getCooldownSeconds } from '../../domain/combat/SkillCooldownTiming';
import { Hero } from '../../domain/entities/Hero';
import { getHeroCombatSkill } from '../../domain/progression/combat/HeroCombatSkillCatalog';
import { SkillCooldownMap, SkillCooldownTracker, combatantKey } from '../../domain/services/combat/SkillCooldownTracker';
import { HeroSkillCooldownDto } from '../dto/GameStateDto';

export function mapHeroSkillCooldowns(
  hero: Hero,
  skillCooldowns: SkillCooldownMap | undefined,
): HeroSkillCooldownDto[] {
  if (!skillCooldowns) return [];

  const key = combatantKey('hero', hero.id);
  const tracker = SkillCooldownTracker.fromMap(skillCooldowns);

  return hero.toProps().equippedSkillIds.map((skillId) => {
    const definition = getHeroCombatSkill(skillId);
    const secondsRemaining = tracker.getRemaining(key, skillId);
    const baseCooldown = definition ? getCooldownSeconds(definition) : 0;
    const cooldownTotal = Math.max(baseCooldown, secondsRemaining, 0);

    return {
      skillId,
      secondsRemaining,
      cooldownTotal,
      ready: secondsRemaining <= 0 || baseCooldown <= 0,
    };
  });
}
