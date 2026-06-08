import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import {
  countUpgradeItems,
  getGearUpgradeInfo,
  renderUpgradeBadge,
  sortGearByBestGain,
} from './GearComparison';
import { GEAR_SLOT_LABELS, GEAR_SLOTS, GearSlotKey, renderGearCard } from './GearPresentation';

export type InventorySortMode = 'gain' | 'name';

export type InventoryModalHandlers = {
  onEquipGear: (gearId: string) => void;
  onFilterChange: (slot: GearSlotKey | 'all') => void;
  onSortChange: (mode: InventorySortMode) => void;
  onOptimizeLoadout: () => void;
};

export class InventoryModalRenderer {
  private activeFilter: GearSlotKey | 'all' = 'all';
  private sortMode: InventorySortMode = 'gain';

  render(
    container: HTMLElement,
    state: GameStateDto,
    handlers: InventoryModalHandlers,
    options: { showOptimize?: boolean } = {},
  ): void {
    const inventoryIcon = getAssetUrl(ASSETS.ui.inventory);
    const filtered =
      this.activeFilter === 'all'
        ? state.inventory
        : state.inventory.filter((gear) => gear.slot === this.activeFilter);

    const sorted =
      this.sortMode === 'gain'
        ? sortGearByBestGain(state, filtered)
        : [...filtered].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));

    const upgradeCount = countUpgradeItems(state);
    const optimizeButton =
      options.showOptimize === false
        ? '<p class="inventory-optimize-locked">Otimizar equipe: desbloqueie em Melhorias.</p>'
        : `
      <div class="inventory-optimize-row">
        <button
          type="button"
          class="gear-equip-btn inventory-optimize-btn"
          data-optimize-loadout
          ${upgradeCount === 0 ? 'disabled' : ''}
        >
          Otimizar equipe${upgradeCount > 0 ? ` (↑${upgradeCount})` : ''}
        </button>
      </div>
    `;

    const filterButtons = `
      <div class="modal-filters">
        <button type="button" class="filter-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>
        ${GEAR_SLOTS.map(
          (slot) => `
            <button type="button" class="filter-btn ${this.activeFilter === slot ? 'active' : ''}" data-filter="${slot}">
              ${GEAR_SLOT_LABELS[slot]}
            </button>
          `,
        ).join('')}
      </div>
    `;

    const sortButtons = `
      <div class="modal-sort">
        <span class="modal-sort-label">Ordenar:</span>
        <button type="button" class="filter-btn ${this.sortMode === 'gain' ? 'active' : ''}" data-sort="gain">Melhor ganho</button>
        <button type="button" class="filter-btn ${this.sortMode === 'name' ? 'active' : ''}" data-sort="name">Nome</button>
      </div>
    `;

    if (state.inventory.length === 0) {
      container.innerHTML = `
        ${optimizeButton}
        ${filterButtons}
        ${sortButtons}
        <p class="empty-state modal-empty">
          ${imgTag(inventoryIcon, 'Inventário', 'stat-icon')}
          Nenhum item ainda. Derrote inimigos e abra baús!
        </p>
      `;
      this.bindFilters(container, handlers);
      this.bindSort(container, handlers);
      this.bindOptimize(container, handlers);
      return;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        ${optimizeButton}
        ${filterButtons}
        ${sortButtons}
        <p class="empty-state modal-empty">Nenhum item nesta categoria.</p>
      `;
      this.bindFilters(container, handlers);
      this.bindSort(container, handlers);
      this.bindOptimize(container, handlers);
      return;
    }

    container.innerHTML = `
      ${optimizeButton}
      ${filterButtons}
      ${sortButtons}
      <div class="modal-gear-list">
        ${sorted
          .map((gear) => {
            const upgrade = getGearUpgradeInfo(state, gear);
            return renderGearCard(gear, {
              actionLabel: 'Equipar',
              actionDataAttrs: { 'data-equip-gear': gear.id },
              upgradeBadge: renderUpgradeBadge(upgrade.status),
            });
          })
          .join('')}
      </div>
    `;

    this.bindFilters(container, handlers);
    this.bindSort(container, handlers);
    this.bindOptimize(container, handlers);

    container.querySelectorAll('[data-equip-gear]').forEach((button) => {
      button.addEventListener('click', () => {
        const gearId = button.getAttribute('data-equip-gear');
        if (gearId) handlers.onEquipGear(gearId);
      });
    });
  }

  private bindFilters(container: HTMLElement, handlers: InventoryModalHandlers): void {
    container.querySelectorAll('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter') as GearSlotKey | 'all';
        this.activeFilter = filter;
        handlers.onFilterChange(filter);
      });
    });
  }

  private bindOptimize(container: HTMLElement, handlers: InventoryModalHandlers): void {
    const button = container.querySelector('[data-optimize-loadout]') as HTMLButtonElement | null;
    button?.addEventListener('click', () => {
      if (button.disabled) return;
      handlers.onOptimizeLoadout();
    });
  }

  private bindSort(container: HTMLElement, handlers: InventoryModalHandlers): void {
    container.querySelectorAll('[data-sort]').forEach((button) => {
      button.addEventListener('click', () => {
        const sort = button.getAttribute('data-sort') as InventorySortMode;
        this.sortMode = sort;
        handlers.onSortChange(sort);
      });
    });
  }

  resetFilter(): void {
    this.activeFilter = 'all';
    this.sortMode = 'gain';
  }
}
