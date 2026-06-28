import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { getUpgradeById, UPGRADE_CATALOG } from '../../domain/upgrades/UpgradeCatalog';
import { FeatureKey } from '../../domain/upgrades/FeatureKey';
import { UpgradeRequirement } from '../../domain/upgrades/UpgradeRequirement';
import { getUpgradeNodePosition, UPGRADE_TREE_VIEWBOX } from './UpgradeTreeLayout';

export interface UpgradeTreeEdge {
  fromId: string;
  toId: string;
}

export interface PositionedUpgradeNode {
  node: UpgradeNodeDto;
  x: number;
  y: number;
}

export function resolveUpgradeParentIds(upgradeId: string): string[] {
  const definition = getUpgradeById(upgradeId);
  if (!definition) return [];

  return definition.requirements
    .filter((requirement): requirement is Extract<UpgradeRequirement, { type: 'upgrade_level' }> => {
      return requirement.type === 'upgrade_level';
    })
    .map((requirement) => findUpgradeIdByFeatureLevel(requirement.feature, requirement.minLevel))
    .filter((parentId): parentId is string => Boolean(parentId));
}

function findUpgradeIdByFeatureLevel(feature: FeatureKey, level: number): string | undefined {
  return UPGRADE_CATALOG.find((entry) => entry.feature === feature && entry.level === level)?.id;
}

export function buildBranchEdges(nodes: UpgradeNodeDto[]): UpgradeTreeEdge[] {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: UpgradeTreeEdge[] = [];

  for (const node of nodes) {
    for (const parentId of resolveUpgradeParentIds(node.id)) {
      if (!nodeIds.has(parentId)) continue;
      edges.push({ fromId: parentId, toId: node.id });
    }
  }

  return edges;
}

export function buildPositionedNodes(branch: UpgradeNodeDto['branch'], nodes: UpgradeNodeDto[]): PositionedUpgradeNode[] {
  return nodes
    .map((node) => {
      const position = getUpgradeNodePosition(branch, node.id);
      if (!position) return null;
      return { node, x: position.x, y: position.y };
    })
    .filter((entry): entry is PositionedUpgradeNode => Boolean(entry));
}

export function buildEdgePath(
  from: PositionedUpgradeNode,
  to: PositionedUpgradeNode,
  viewBox: { width: number; height: number },
): string {
  const startX = from.x;
  const startY = from.y;
  const endX = to.x;
  const endY = to.y;
  const midY = (startY + endY) / 2;

  if (Math.abs(startY - endY) < 8) {
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
}

export function getBranchViewBox(branch: UpgradeNodeDto['branch']): { width: number; height: number } {
  return UPGRADE_TREE_VIEWBOX[branch];
}

export function pickDefaultBranch(nodes: UpgradeNodeDto[]): UpgradeNodeDto['branch'] {
  const available = nodes.find((node) => node.status === 'available');
  if (available) return available.branch;

  const ready = nodes.find((node) => node.status === 'ready');
  if (ready) return ready.branch;

  return nodes[0]?.branch ?? 'combat';
}

export function upgradeNodeShortLabel(node: UpgradeNodeDto): string {
  if (node.feature.startsWith('hero_unlock')) {
    return node.name.includes('Berserker') ? '⚔' : '🛡';
  }

  if (node.feature === 'divine_forge') return '⚒';

  if (node.level > 1) {
    return toRoman(node.level);
  }

  return node.name.slice(0, 1).toUpperCase();
}

function toRoman(level: number): string {
  const map: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
  };
  return map[level] ?? String(level);
}
