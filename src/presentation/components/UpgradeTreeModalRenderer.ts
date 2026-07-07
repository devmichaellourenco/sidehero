import { GameStateDto } from '../../application/dto/GameStateDto';
import { UPGRADE_BRANCH_LABELS } from '../../application/dto/UpgradeBranchDto';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import {
  buildEdgePath,
  buildPositionedNodes,
  buildUpgradeTreeEdges,
  findFocusNodeId,
  getUnifiedViewBox,
  PositionedUpgradeNode,
  upgradeNodeShortLabel,
} from './UpgradeTreeGraphPresentation';
import {
  bindUpgradeTreeViewport,
  captureUpgradeTreeViewport,
  focusUpgradeTreeNode,
  type UpgradeTreeViewportState,
} from './UpgradeTreeViewportBinder';

export type UpgradeTreeHandlers = {
  onPurchase: (upgradeId: string) => void;
};

const TOOLTIP_PORTAL_ID = 'upgrade-node-tooltip-portal';
let tooltipHideTimer: number | null = null;
let unbindViewport: (() => void) | null = null;

export class UpgradeTreeModalRenderer {
  private nodeById = new Map<string, UpgradeNodeDto>();
  private preservedViewport: UpgradeTreeViewportState | null = null;
  private autoFocusPending = true;

  /** Chamar ao abrir o modal de melhorias (nova sessão). */
  beginSession(): void {
    this.preservedViewport = null;
    this.autoFocusPending = true;
  }

  render(
    container: HTMLElement,
    state: GameStateDto,
    nodes: UpgradeNodeDto[],
    handlers: UpgradeTreeHandlers,
  ): void {
    const existingViewport = container.querySelector('[data-upgrade-tree-viewport]') as HTMLElement | null;
    if (existingViewport) {
      this.preservedViewport = captureUpgradeTreeViewport(existingViewport) ?? this.preservedViewport;
    }

    unbindViewport?.();
    unbindViewport = null;

    this.nodeById = new Map(nodes.map((node) => [node.id, node]));

    const goldIcon = imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'shop-gold-icon');
    const positioned = buildPositionedNodes(nodes);
    const viewBox = getUnifiedViewBox();
    const edges = buildUpgradeTreeEdges(nodes);
    const positionedById = new Map(positioned.map((entry) => [entry.node.id, entry]));
    const focusNodeId = findFocusNodeId(nodes);

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

    const nodeMarkup = positioned.map((entry) => this.renderNode(entry, viewBox)).join('');

    container.innerHTML = `
      <p class="upgrade-balance">Seu ouro: ${goldIcon} <strong>${state.gold}</strong></p>
      <div class="upgrade-tree-shell">
        <div class="upgrade-tree-toolbar">
          <button type="button" class="upgrade-tree-focus-btn" data-upgrade-focus-available>
            Ir para disponível
          </button>
          ${this.renderLegend()}
        </div>
        <div class="upgrade-tree-viewport" data-upgrade-tree-viewport>
          <div
            class="upgrade-tree-stage"
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
      </div>
    `;

    const viewport = container.querySelector('[data-upgrade-tree-viewport]') as HTMLElement;
    const shouldAutoFocus = this.autoFocusPending;
    unbindViewport = bindUpgradeTreeViewport(viewport, {
      initialState: this.preservedViewport,
      onTransformChange: (next) => {
        this.preservedViewport = next;
      },
    });

    if (shouldAutoFocus && focusNodeId) {
      requestAnimationFrame(() => {
        const focused = focusUpgradeTreeNode(viewport, focusNodeId);
        if (focused) {
          this.preservedViewport = focused;
        }
        this.autoFocusPending = false;
      });
    } else {
      this.autoFocusPending = false;
    }

    container.querySelector('[data-upgrade-focus-available]')?.addEventListener('click', () => {
      const nextFocus = findFocusNodeId(nodes);
      if (nextFocus) {
        const focused = focusUpgradeTreeNode(viewport, nextFocus);
        if (focused) {
          this.preservedViewport = focused;
        }
      }
    });

    this.bindNodeTooltips(container, handlers);
  }

  private renderLegend(): string {
    const branches = ['combat', 'chests', 'equipment', 'economy', 'heroes', 'qol'] as const;
    return `
      <div class="upgrade-tree-legend" aria-label="Ramos da árvore">
        ${branches
          .map(
            (branch) =>
              `<span class="upgrade-tree-legend-item upgrade-tree-legend-item--${branch}">${UPGRADE_BRANCH_LABELS[branch]}</span>`,
          )
          .join('')}
      </div>
    `;
  }

  private renderNode(
    entry: PositionedUpgradeNode,
    viewBox: { width: number; height: number },
  ): string {
    const { node, x, y } = entry;
    const label = upgradeNodeShortLabel(node);
    const statusClass = `upgrade-node--${node.status}`;

    return `
      <button
        type="button"
        class="upgrade-node ${statusClass} upgrade-node--branch-${node.branch}"
        data-upgrade-node="${node.id}"
        data-upgrade-status="${node.status}"
        style="left: ${(x / viewBox.width) * 100}%; top: ${(y / viewBox.height) * 100}%;"
        aria-label="${node.name}"
      >
        <span class="upgrade-node-ring" aria-hidden="true"></span>
        <span class="upgrade-node-core">${label}</span>
        ${node.status === 'owned' ? '<span class="upgrade-node-owned-mark" aria-hidden="true">✓</span>' : ''}
        ${node.status === 'available' ? '<span class="upgrade-node-pulse" aria-hidden="true"></span>' : ''}
      </button>
    `;
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
