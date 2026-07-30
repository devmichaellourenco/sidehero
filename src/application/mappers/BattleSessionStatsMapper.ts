import { BattleSessionStatsProps } from '../../domain/combat/BattleSessionStats';
import { DAMAGE_ELEMENT_LABELS } from '../../domain/combat/DamageElement';
import { Hero } from '../../domain/entities/Hero';
import { BASIC_ATTACK_SKILL_ID } from '../../domain/progression/combat/BasicAttackSkill';
import { getSkillById } from '../../domain/progression/SkillCatalog';
import { BattleSessionStatsDto } from '../dto/GameStateDto';

function skillDisplayName(skillId: string): string {
  if (skillId === BASIC_ATTACK_SKILL_ID) return 'Ataque básico';
  return getSkillById(skillId)?.name ?? skillId;
}

export function mapBattleSessionStats(
  stats: BattleSessionStatsProps,
  roster: readonly Hero[],
): BattleSessionStatsDto {
  const nameById = new Map(roster.map((hero) => [hero.id, hero.name]));

  const heroes = Object.values(stats.heroes)
    .map((hero) => ({
      heroId: hero.heroId,
      name: nameById.get(hero.heroId) ?? hero.heroId,
      damageDealt: hero.damageDealt,
      healingDone: hero.healingDone,
      damageTaken: hero.damageTaken,
      damageMitigated: hero.damageMitigated,
      critCount: hero.critCount,
      basicAttackUses: hero.basicAttackUses,
      skillUses: hero.skillUses,
      damageByElement: { ...hero.damageByElement },
      damageTakenByElement: { ...hero.damageTakenByElement },
      damageMitigatedByElement: { ...hero.damageMitigatedByElement },
    }))
    .sort((a, b) => b.damageDealt - a.damageDealt || b.healingDone - a.healingDone);

  const skills = Object.values(stats.skills)
    .map((skill) => ({
      heroId: skill.heroId,
      heroName: nameById.get(skill.heroId) ?? skill.heroId,
      skillId: skill.skillId,
      skillName: skillDisplayName(skill.skillId),
      uses: skill.uses,
      damageDealt: skill.damageDealt,
      healingDone: skill.healingDone,
    }))
    .sort((a, b) => b.damageDealt - a.damageDealt || b.healingDone - a.healingDone || b.uses - a.uses);

  return {
    damageDealt: stats.damageDealt,
    healingDone: stats.healingDone,
    damageTaken: stats.damageTaken,
    damageMitigated: stats.damageMitigated,
    critCount: stats.critCount,
    damageByElement: { ...stats.damageByElement },
    damageTakenByElement: { ...stats.damageTakenByElement },
    damageMitigatedByElement: { ...stats.damageMitigatedByElement },
    heroes,
    skills,
  };
}

export { DAMAGE_ELEMENT_LABELS };
