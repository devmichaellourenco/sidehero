import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { getUpgradeById } from '../../domain/upgrades/UpgradeCatalog';
import { UPGRADE_CATALOG } from '../../domain/upgrades/UpgradeCatalog';
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

const NODE_RADIUS = 28;
const AXIS_EPSILON = 14;
const ROUTE_PADDING = 18;

interface Point {
  x: number;
  y: number;
}

export function resolveUpgradeParentIds(upgradeId: string): string[] {
  const definition = getUpgradeById(upgradeId);
  if (!definition) return [];

  if (definition.parents.length > 0) {
    return definition.parents;
  }

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

export function buildUpgradeTreeEdges(nodes: UpgradeNodeDto[]): UpgradeTreeEdge[] {
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

/** @deprecated use buildUpgradeTreeEdges */
export const buildBranchEdges = buildUpgradeTreeEdges;

export function buildPositionedNodes(nodes: UpgradeNodeDto[]): PositionedUpgradeNode[] {
  return nodes
    .map((node) => {
      const position = getUpgradeNodePosition(node.id);
      if (!position) return null;
      return { node, x: position.x, y: position.y };
    })
    .filter((entry): entry is PositionedUpgradeNode => Boolean(entry));
}

function anchorOnNode(node: PositionedUpgradeNode, toward: Point): Point {
  const dx = toward.x - node.x;
  const dy = toward.y - node.y;
  const distance = Math.hypot(dx, dy) || 1;

  return {
    x: node.x + (dx / distance) * NODE_RADIUS,
    y: node.y + (dy / distance) * NODE_RADIUS,
  };
}

function laneOffset(edgeKey: string): number {
  let hash = 0;
  for (let index = 0; index < edgeKey.length; index += 1) {
    hash = (hash + edgeKey.charCodeAt(index) * (index + 1)) % 5;
  }
  return (hash - 2) * 4;
}

function shiftPoint(point: Point, dx: number, dy: number): Point {
  return { x: point.x + dx, y: point.y + dy };
}

export function buildEdgePath(
  from: PositionedUpgradeNode,
  to: PositionedUpgradeNode,
  _viewBox: { width: number; height: number } = UPGRADE_TREE_VIEWBOX,
): string {
  const fromCenter = { x: from.x, y: from.y };
  const toCenter = { x: to.x, y: to.y };
  const start = anchorOnNode(from, toCenter);
  const end = anchorOnNode(to, fromCenter);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const offset = laneOffset(`${from.node.id}->${to.node.id}`);

  if (Math.abs(dy) <= AXIS_EPSILON) {
    const shiftedStart = shiftPoint(start, 0, offset);
    const shiftedEnd = shiftPoint(end, 0, offset);
    return `M ${shiftedStart.x} ${shiftedStart.y} L ${shiftedEnd.x} ${shiftedEnd.y}`;
  }

  if (Math.abs(dx) <= AXIS_EPSILON) {
    const shiftedStart = shiftPoint(start, offset, 0);
    const shiftedEnd = shiftPoint(end, offset, 0);
    return `M ${shiftedStart.x} ${shiftedStart.y} L ${shiftedEnd.x} ${shiftedEnd.y}`;
  }

  const verticalFirst = Math.abs(dy) >= Math.abs(dx);
  const routeAbove = toCenter.y < fromCenter.y;

  if (verticalFirst) {
    const laneX = start.x + offset;
    const elbowY = routeAbove
      ? Math.min(start.y, end.y) - ROUTE_PADDING
      : Math.max(start.y, end.y) + ROUTE_PADDING;

    return [
      `M ${start.x} ${start.y}`,
      `L ${laneX} ${start.y}`,
      `L ${laneX} ${elbowY}`,
      `L ${end.x + offset} ${elbowY}`,
      `L ${end.x + offset} ${end.y}`,
      `L ${end.x} ${end.y}`,
    ].join(' ');
  }

  const laneY = start.y + offset;
  const elbowX = dx > 0 ? Math.max(start.x, end.x) + ROUTE_PADDING : Math.min(start.x, end.x) - ROUTE_PADDING;

  return [
    `M ${start.x} ${start.y}`,
    `L ${start.x} ${laneY}`,
    `L ${elbowX} ${laneY}`,
    `L ${elbowX} ${end.y + offset}`,
    `L ${end.x} ${end.y + offset}`,
    `L ${end.x} ${end.y}`,
  ].join(' ');
}

export function getUnifiedViewBox(): { width: number; height: number } {
  return UPGRADE_TREE_VIEWBOX;
}

export function findFocusNodeId(nodes: UpgradeNodeDto[]): string | null {
  const available = nodes.find((node) => node.status === 'available');
  if (available) return available.id;

  const ready = nodes.find((node) => node.status === 'ready');
  if (ready) return ready.id;

  const locked = nodes.find((node) => node.status === 'locked');
  return locked?.id ?? nodes[0]?.id ?? null;
}

export function upgradeNodeShortLabel(node: UpgradeNodeDto): string {
  if (node.feature.startsWith('hero_unlock')) {
    return node.name.includes('Berserker') ? '⚔' : '🛡';
  }

  if (node.feature === 'divine_forge') return '⚒';

  if (node.feature === 'background_tick') return '⏱';

  if (node.feature === 'battle_skill_slots') return '✦';

  if (node.feature === 'shop_refresh') return '🛒';

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
