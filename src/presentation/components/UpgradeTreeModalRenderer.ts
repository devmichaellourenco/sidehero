import { GameStateDto } from '../../application/dto/GameStateDto';
import {
  UPGRADE_BRANCH_LABELS,
  UPGRADE_BRANCH_ORDER,
} from '../../application/dto/UpgradeBranchDto';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';

export type UpgradeTreeHandlers = {
  onPurchase: (upgradeId: string) => void;
};

export class UpgradeTreeModalRenderer {
  render(
    container: HTMLElement,
    state: GameStateDto,
    nodes: UpgradeNodeDto[],
    handlers: UpgradeTreeHandlers,
  ): void {
    const goldIcon = imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'shop-gold-icon');
    const sections = UPGRADE_BRANCH_ORDER.map((branch) => {
      const branchNodes = nodes.filter((node) => node.branch === branch);
      if (branchNodes.length === 0) return '';

      const cards = branchNodes.map((node) => this.renderNodeCard(node, goldIcon)).join('');

      return `
        <section class="upgrade-branch">
          <h3 class="upgrade-branch-title">${UPGRADE_BRANCH_LABELS[branch]}</h3>
          <div class="upgrade-branch-list">${cards}</div>
        </section>
      `;
    }).join('');

    container.innerHTML = `
      <p class="upgrade-intro">
        Invista ouro para desbloquear automações. Compras são permanentes — depois ligue/desligue em Configurações.
      </p>
      <p class="upgrade-balance">Seu ouro: ${goldIcon} <strong>${state.gold}</strong></p>
      <div class="upgrade-tree">${sections}</div>
    `;

    container.querySelectorAll('[data-upgrade-buy]').forEach((button) => {
      button.addEventListener('click', () => {
        const upgradeId = button.getAttribute('data-upgrade-buy');
        if (upgradeId && !(button as HTMLButtonElement).disabled) {
          handlers.onPurchase(upgradeId);
        }
      });
    });
  }

  private renderNodeCard(node: UpgradeNodeDto, goldIcon: string): string {
    const statusClass = `upgrade-card-${node.status}`;
    const requirements = node.requirements
      .map((req) => `<li class="${req.met ? 'met' : 'unmet'}">${req.label}</li>`)
      .join('');

    const action = this.renderAction(node, goldIcon);

    return `
      <article class="upgrade-card ${statusClass}">
        <header class="upgrade-card-header">
          <strong>${node.name}</strong>
          <span class="upgrade-card-cost">${goldIcon} ${node.cost}</span>
        </header>
        <p class="upgrade-card-desc">${node.description}</p>
        ${
          node.status !== 'owned' && requirements
            ? `<ul class="upgrade-card-reqs">${requirements}</ul>`
            : ''
        }
        ${action}
      </article>
    `;
  }

  private renderAction(node: UpgradeNodeDto, goldIcon: string): string {
    if (node.status === 'owned') {
      return '<span class="upgrade-owned-badge">✓ Desbloqueado</span>';
    }

    if (node.status === 'available') {
      return `
        <button type="button" class="gear-equip-btn upgrade-buy-btn" data-upgrade-buy="${node.id}">
          Comprar ${goldIcon} ${node.cost}
        </button>
      `;
    }

    if (node.status === 'ready') {
      return `
        <button type="button" class="gear-equip-btn upgrade-buy-btn" disabled>
          Falta ouro (${goldIcon} ${node.cost})
        </button>
      `;
    }

    return '<span class="upgrade-locked-label">Bloqueado</span>';
  }
}
