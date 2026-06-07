import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { GEAR_SLOT_LABELS, GEAR_SLOTS, GearSlotKey, renderGearCard } from './GearPresentation';

export type InventoryModalHandlers = {
  onEquipGear: (gearId: string) => void;
  onFilterChange: (slot: GearSlotKey | 'all') => void;
};

export class InventoryModalRenderer {
  private activeFilter: GearSlotKey | 'all' = 'all';

  render(
    container: HTMLElement,
    state: GameStateDto,
    handlers: InventoryModalHandlers,
  ): void {
    const inventoryIcon = getAssetUrl(ASSETS.ui.inventory);
    const filtered =
      this.activeFilter === 'all'
        ? state.inventory
        : state.inventory.filter((gear) => gear.slot === this.activeFilter);

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

    if (state.inventory.length === 0) {
      container.innerHTML = `
        ${filterButtons}
        <p class="empty-state modal-empty">
          ${imgTag(inventoryIcon, 'Inventário', 'stat-icon')}
          Nenhum item ainda. Derrote inimigos e abra baús!
        </p>
      `;
      this.bindFilters(container, handlers);
      return;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        ${filterButtons}
        <p class="empty-state modal-empty">Nenhum item nesta categoria.</p>
      `;
      this.bindFilters(container, handlers);
      return;
    }

    container.innerHTML = `
      ${filterButtons}
      <div class="modal-gear-list">
        ${filtered
          .map((gear) =>
            renderGearCard(gear, {
              actionLabel: 'Equipar',
              actionDataAttrs: { 'data-equip-gear': gear.id },
            }),
          )
          .join('')}
      </div>
    `;

    this.bindFilters(container, handlers);

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

  resetFilter(): void {
    this.activeFilter = 'all';
  }
}
