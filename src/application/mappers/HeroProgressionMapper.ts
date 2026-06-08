import { Hero } from '../../domain/entities/Hero';
import { SkillNodeView } from '../../domain/progression/SkillService';
import { SkillNodeDto } from '../dto/SkillNodeDto';
import {
  buildSkillBattleStats,
  formatBranchLabel,
  formatScalingLabel,
  formatScopeLabel,
} from './SkillBattleStatsMapper';

export function mapSkillTree(hero: Hero, nodes: SkillNodeView[]): SkillNodeDto[] {
  return nodes.map((node) => {
    const branch = node.definition.branch;
    const scope = node.definition.scope;
    const scaling = node.definition.scaling;

    return {
      id: node.definition.id,
      name: node.definition.name,
      description: node.definition.description,
      branch,
      branchLabel: formatBranchLabel(branch),
      scope,
      scopeLabel:
        node.definition.pointType === 'ascension' ? 'Ascensão' : formatScopeLabel(scope),
      maxRank: node.definition.maxRank,
      currentRank: node.currentRank,
      status: node.status,
      isEquipped: node.isEquipped,
      canActivate: node.canActivate,
      canDeactivate: node.canDeactivate,
      activationCost: node.activationCost,
      scaling,
      scalingLabel: formatScalingLabel(scaling),
      battleStats: buildSkillBattleStats(hero, node.definition.id, scaling),
      requirements: node.requirements,
    };
  });
}
