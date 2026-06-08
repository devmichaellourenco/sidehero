import { SkillNodeView } from '../../domain/progression/SkillService';
import { SkillNodeDto } from '../dto/SkillNodeDto';

export function mapSkillTree(nodes: SkillNodeView[]): SkillNodeDto[] {
  return nodes.map((node) => ({
    id: node.definition.id,
    name: node.definition.name,
    description: node.definition.description,
    branch: node.definition.branch,
    scope: node.definition.scope,
    maxRank: node.definition.maxRank,
    currentRank: node.currentRank,
    status: node.status,
    isEquipped: node.isEquipped,
    activationCost: node.activationCost,
    scaling: node.definition.scaling,
    requirements: node.requirements,
  }));
}
