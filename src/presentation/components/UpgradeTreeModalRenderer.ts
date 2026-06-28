import { GameStateDto } from '../../application/dto/GameStateDto';
import { UpgradeBranchDto, UPGRADE_BRANCH_LABELS, UPGRADE_BRANCH_ORDER } from '../../application/dto/UpgradeBranchDto';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import {
  buildBranchEdges,
  buildEdgePath,
  buildPositionedNodes,
  getBranchViewBox,
  pickDefaultBranch,
  PositionedUpgradeNode,
  upgradeNodeShortLabel,
} from './UpgradeTreeGraphPresentation';

export type UpgradeTreeHandlers = {
  onPurchase: (upgradeId: string) => void;
};

const TOOLTIP_PORTAL_ID = 'upgrade-node-tooltip-portal';
let tooltipHideTimer: number | null = null;

export class UpgradeTreeModalRenderer {
  private activeBranch: UpgradeBranchDto | null = null;
  private nodeById = new Map<string, UpgradeNodeDto>();

  render(
    container: HTMLElement,
    state: GameStateDto,
    nodes: UpgradeNodeDto[],
    handlers: UpgradeTreeHandlers,
  ): void {
    this.nodeById = new Map(nodes.map((node) => [node.id, node]));

    if (!this.activeBranch || !nodes.some((node) => node.branch === this.activeBranch)) {
      this.activeBranch = pickDefaultBranch(nodes);
    }

    const goldIcon = imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'shop-gold-icon');
    const tabs = this.renderBranchTabs(nodes);
    const canvas = this.renderBranchCanvas(this.activeBranch, nodes);

    container.innerHTML = `
      <p class="upgrade-intro">
        Passe o mouse nos nodos para ver detalhes. Compras são permanentes — ligue/desligue em Configurações.
      </p>
      <p class="upgrade-balance">Seu ouro: ${goldIcon} <strong>${state.gold}</strong></p>
      <div class="upgrade-tree-shell">
        ${tabs}
        ${canvas}
      </div>
    `;

    this.bindBranchTabs(container, nodes, state, handlers);
    this.bindNodeTooltips(container, handlers);
  }

  private renderBranchTabs(nodes: UpgradeNodeDto[]): string {
    const tabs = UPGRADE_BRANCH_ORDER.map((branch) => {
      const branchNodes = nodes.filter((node) => node.branch === branch);
      if (branchNodes.length === 0) return '';

      const availableCount = branchNodes.filter((node) => node.status === 'available').length;
      const ownedCount = branchNodes.filter((node) => node.status === 'owned').length;
      const active = branch === this.activeBranch ? ' upgrade-branch-tab--active' : '';
      const badge =
        availableCount > 0
          ? `<span class="upgrade-branch-tab-badge">${availableCount}</span>`
          : '';

      return `
        <button
          type="button"
          class="upgrade-branch-tab${active}"
          data-upgrade-branch-tab="${branch}"
          aria-pressed="${branch === this.activeBranch}"
        >
          <span class="upgrade-branch-tab-label">${UPGRADE_BRANCH_LABELS[branch]}</span>
          <span class="upgrade-branch-tab-meta">${ownedCount}/${branchNodes.length}${badge}</span>
        </button>
      `;
    }).join('');

    return `<div class="upgrade-branch-tabs" role="tablist" aria-label="Ramos de melhorias">${tabs}</div>`;
  }

  private renderBranchCanvas(branch: UpgradeBranchDto, nodes: UpgradeNodeDto[]): string {
    const branchNodes = nodes.filter((node) => node.branch === branch);
    const positioned = buildPositionedNodes(branch, branchNodes);
    const viewBox = getBranchViewBox(branch);
    const edges = buildBranchEdges(branchNodes);
    const positionedById = new Map(positioned.map((entry) => [entry.node.id, entry]));

    const edgeMarkup = edges
      .map((edge) => {
        const from = positionedById.get(edge.fromId);
        const to = positionedById.get(edge.toId);
        if (!from || !to) return '';

        const owned = from.node.status === 'owned' && to.node.status !== 'locked';
        const path = buildEdgePath(from, to, viewBox);
        return `<path class="upgrade-tree-edge${owned ? ' upgrade-tree-edge--active' : ''}" d="${path}" />`;
      })
      .join('');

    const nodeMarkup = positioned.map((entry) => this.renderNode(entry)).join('');

    return `
      <div class="upgrade-tree-viewport" data-upgrade-branch-panel="${branch}">
        <div
          class="upgrade-tree-canvas"
          style="width: ${viewBox.width}px; height: ${viewBox.height}px;"
        >
          <svg
            class="upgrade-tree-edges"
            viewBox="0 0 ${viewBox.width} ${viewBox.height}"
            aria-hidden="true"
          >
            ${edgeMarkup}
          </svg>
          <div class="upgrade-tree-nodes">${nodeMarkup}</div>
        </div>
      </div>
    `;
  }

  private renderNode(entry: PositionedUpgradeNode): string {
    const { node, x, y } = entry;
    const label = upgradeNodeShortLabel(node);
    const statusClass = `upgrade-node--${node.status}`;

    return `
      <button
        type="button"
        class="upgrade-node ${statusClass}"
        data-upgrade-node="${node.id}"
        data-upgrade-status="${node.status}"
        style="left: ${(x / getBranchViewBox(node.branch).width) * 100}%; top: ${(y / getBranchViewBox(node.branch).height) * 100}%;"
        aria-label="${node.name}"
      >
        <span class="upgrade-node-ring" aria-hidden="true"></span>
        <span class="upgrade-node-core">${label}</span>
        ${node.status === 'owned' ? '<span class="upgrade-node-owned-mark" aria-hidden="true">✓</span>' : ''}
        ${node.status === 'available' ? '<span class="upgrade-node-pulse" aria-hidden="true"></span>' : ''}
      </button>
    `;
  }

  private bindBranchTabs(
    container: HTMLElement,
    nodes: UpgradeNodeDto[],
    state: GameStateDto,
    handlers: UpgradeTreeHandlers,
  ): void {
    container.querySelectorAll('[data-upgrade-branch-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        const branch = tab.getAttribute('data-upgrade-branch-tab') as UpgradeBranchDto | null;
        if (!branch) return;
        this.activeBranch = branch;
        this.render(container, state, nodes, handlers);
      });
    });
  }

  private bindNodeTooltips(container: HTMLElement, handlers: UpgradeTreeHandlers): void {
    hideUpgradeNodeTooltip();

    container.querySelectorAll('[data-upgrade-node]').forEach((element) => {
      const nodeId = element.getAttribute('data-upgrade-node');
      if (!nodeId) return;

      const node = this.nodeById.get(nodeId);
      if (!node) return;

      const show = () => {
        cancelUpgradeTooltipHide();
        showUpgradeNodeTooltip(
          element as HTMLElement,
          node,
          this.renderTooltipContent(node),
          (upgradeId) => handlers.onPurchase(upgradeId),
        );
      };

      element.addEventListener('mouseenter', show);
      element.addEventListener('mouseleave', scheduleUpgradeTooltipHide);
      element.addEventListener('focus', show);
      element.addEventListener('blur', scheduleUpgradeTooltipHide);
    });
  }

  private renderTooltipContent(node: UpgradeNodeDto): string {
    const goldIcon = imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'upgrade-tooltip-gold-icon');
    const requirements = node.requirements
      .map((req) => `<li class="${req.met ? 'met' : 'unmet'}">${req.label}</li>`)
      .join('');

    const requirementsBlock =
      node.status !== 'owned' && requirements
        ? `<ul class="upgrade-tooltip-reqs">${requirements}</ul>`
        : '';

    const action = this.renderTooltipAction(node, goldIcon);

    return `
      <p class="upgrade-tooltip-eyebrow">${UPGRADE_BRANCH_LABELS[node.branch]}</p>
      <h4 class="upgrade-tooltip-title">${node.name}</h4>
      <p class="upgrade-tooltip-desc">${node.description}</p>
      <p class="upgrade-tooltip-cost">Custo: ${goldIcon} <strong>${node.cost}</strong></p>
      ${requirementsBlock}
      ${action}
    `;
  }

  private renderTooltipAction(node: UpgradeNodeDto, goldIcon: string): string {
    if (node.status === 'owned') {
      return '<p class="upgrade-tooltip-status upgrade-tooltip-status--owned">✓ Desbloqueado</p>';
    }

    if (node.status === 'available') {
      return `
        <button type="button" class="gear-equip-btn upgrade-buy-btn" data-upgrade-buy="${node.id}">
          Comprar ${goldIcon} ${node.cost}
        </button>
      `;
    }

    if (node.status === 'ready') {
      return `<p class="upgrade-tooltip-status upgrade-tooltip-status--ready">Falta ouro (${goldIcon} ${node.cost})</p>`;
    }

    return '<p class="upgrade-tooltip-status upgrade-tooltip-status--locked">Complete os requisitos para desbloquear</p>';
  }
}

function ensureTooltipPortal(): HTMLElement {
  let portal = document.getElementById(TOOLTIP_PORTAL_ID);
  if (portal) return portal;

  portal = document.createElement('div');
  portal.id = TOOLTIP_PORTAL_ID;
  portal.className = 'upgrade-node-tooltip-portal hidden';
  portal.setAttribute('role', 'tooltip');
  document.body.appendChild(portal);
  return portal;
}

function scheduleUpgradeTooltipHide(): void {
  cancelUpgradeTooltipHide();
  tooltipHideTimer = window.setTimeout(() => {
    hideUpgradeNodeTooltip();
    tooltipHideTimer = null;
  }, 140);
}

function cancelUpgradeTooltipHide(): void {
  if (tooltipHideTimer === null) return;
  window.clearTimeout(tooltipHideTimer);
  tooltipHideTimer = null;
}

function showUpgradeNodeTooltip(
  anchor: HTMLElement,
  node: UpgradeNodeDto,
  html: string,
  onPurchase: (upgradeId: string) => void,
): void {
  const portal = ensureTooltipPortal();
  portal.className = `upgrade-node-tooltip-portal upgrade-node-tooltip-portal--${node.status}`;
  portal.innerHTML = html;

  portal.onmouseenter = cancelUpgradeTooltipHide;
  portal.onmouseleave = scheduleUpgradeTooltipHide;

  const buyButton = portal.querySelector('[data-upgrade-buy]') as HTMLButtonElement | null;
  if (buyButton) {
    buyButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const upgradeId = buyButton.getAttribute('data-upgrade-buy');
      if (!upgradeId || buyButton.disabled) return;
      hideUpgradeNodeTooltip();
      onPurchase(upgradeId);
    });
  }

  const margin = 10;
  portal.style.visibility = 'hidden';
  portal.classList.remove('hidden');

  const anchorRect = anchor.getBoundingClientRect();
  const portalRect = portal.getBoundingClientRect();
  let top = anchorRect.bottom + margin;
  let left = anchorRect.left + anchorRect.width / 2 - portalRect.width / 2;

  const maxLeft = window.innerWidth - portalRect.width - margin;
  left = Math.max(margin, Math.min(left, maxLeft));

  if (top + portalRect.height > window.innerHeight - margin) {
    top = anchorRect.top - portalRect.height - margin;
  }

  portal.style.top = `${top}px`;
  portal.style.left = `${left}px`;
  portal.style.visibility = 'visible';
}

export function hideUpgradeNodeTooltip(): void {
  cancelUpgradeTooltipHide();
  const portal = document.getElementById(TOOLTIP_PORTAL_ID);
  if (!portal) return;
  portal.classList.add('hidden');
  portal.style.visibility = '';
  portal.innerHTML = '';
  portal.onmouseenter = null;
  portal.onmouseleave = null;
}
