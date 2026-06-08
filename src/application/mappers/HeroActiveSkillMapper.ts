import { Hero } from '../../domain/entities/Hero';
import { getSkillById } from '../../domain/progression/SkillCatalog';
import { HeroActiveSkillDto } from '../dto/GameStateDto';
import { SkillBranchDto } from '../dto/SkillNodeDto';
import {
  buildSkillBattleStats,
  formatBranchLabel,
  formatScalingLabel,
  formatScopeLabel,
} from './SkillBattleStatsMapper';

function mapOne(hero: Hero, skillId: string): HeroActiveSkillDto {
  const props = hero.toProps();
  const definition = getSkillById(skillId);
  const currentRank = props.skillRanks[skillId] ?? (skillId === 'basic_attack' ? 1 : 0);
  const branch = (definition?.branch ?? 'utility') as SkillBranchDto;
  const scalingKey = definition?.scaling ?? 'str';
  const scope = definition?.scope ?? 'universal';

  return {
    id: skillId,
    name: definition?.name ?? skillId,
    branch,
    branchLabel: formatBranchLabel(branch),
    description: definition?.description ?? 'Skill sem descrição.',
    currentRank: Math.max(1, currentRank),
    maxRank: definition?.maxRank ?? 1,
    scope,
    scopeLabel: formatScopeLabel(scope),
    scalingLabel: formatScalingLabel(scalingKey),
    battleStats: buildSkillBattleStats(hero, skillId, scalingKey),
  };
}

export function mapHeroActiveSkills(hero: Hero): HeroActiveSkillDto[] {
  return hero.toProps().equippedSkillIds.map((skillId) => mapOne(hero, skillId));
}
