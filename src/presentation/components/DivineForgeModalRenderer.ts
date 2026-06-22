import { GameStateDto } from '../../application/dto/GameStateDto';
import {
  bindInventoryGearTooltips,
  hideInventoryGearTooltip,
} from './InventoryGearTooltipBinder';
import {
  DivineForgeTab,
  evaluateForgeSelection,
  renderCreateTabPanel,
  renderForgeGrid,
  renderForgeTabs,
  renderSalvageTabPanel,
} from './DivineForgePresentation';

export type DivineForgeModalHandlers = {
  onTabChange: (tab: DivineForgeTab) => void;
  onSelectionChange: () => void;
  onFuse: (gearIds: string[]) => void;
  onSalvage: (gearId: string) => void;
};

export class DivineForgeModalRenderer {
  private activeTab: DivineForgeTab = 'create';
  private selectedIds = new Set<string>();
  private salvageGearId: string | null = null;

  resetSelection(): void {
    this.selectedIds.clear();
    this.salvageGearId = null;
  }

  render(
    container: HTMLElement,
    state: GameStateDto,
    handlers: DivineForgeModalHandlers,
  ): void {
    hideInventoryGearTooltip();

    if (!state.featureFlags.divineForge) {
      container.innerHTML = `
        <div class="forge-panel">
          <p class="empty-state modal-empty">
            Forja Divina bloqueada. Desbloqueie <strong>Forja Divina</strong> em Melhorias.
          </p>
        </div>
      `;
      return;
    }

    const selectionStatus = evaluateForgeSelection(this.selectedIds, state.inventory);
    const selectedSalvageGear =
      this.salvageGearId !== null
        ? state.inventory.find((gear) => gear.id === this.salvageGearId) ?? null
        : null;

    const tabPanel =
      this.activeTab === 'create'
        ? renderCreateTabPanel(selectionStatus)
        : renderSalvageTabPanel(selectedSalvageGear, state.stage);

    container.innerHTML = `
      <div class="forge-panel inventory-panel">
        <p class="forge-panel-intro">
          Combine 9 itens da mesma raridade em um item aleatório superior, ou destrua itens por ouro.
        </p>
        ${renderForgeTabs(this.activeTab)}
        ${tabPanel}
        <p class="inventory-count">${state.storageCapacity.inventoryUsed}/${state.storageCapacity.inventoryLimit} no inventário</p>
        ${renderForgeGrid(state.inventory, {
          tab: this.activeTab,
          selectedIds: this.activeTab === 'create' ? this.selectedIds : new Set(selectedSalvageGear ? [selectedSalvageGear.id] : []),
          stage: state.stage,
        })}
      </div>
    `;

    this.bind(container, handlers);
    bindInventoryGearTooltips(container);
  }

  private bind(container: HTMLElement, handlers: DivineForgeModalHandlers): void {
    container.querySelectorAll('[data-forge-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        const tab = (button as HTMLElement).getAttribute('data-forge-tab') as DivineForgeTab;
        if (!tab || tab === this.activeTab) return;
        this.activeTab = tab;
        this.resetSelection();
        handlers.onTabChange(tab);
      });
    });

    container.querySelectorAll('[data-forge-gear-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const gearId = (button as HTMLElement).getAttribute('data-forge-gear-id');
        if (!gearId) return;

        if (this.activeTab === 'create') {
          if (this.selectedIds.has(gearId)) {
            this.selectedIds.delete(gearId);
          } else if (this.selectedIds.size < 9) {
            this.selectedIds.add(gearId);
          }
        } else {
          this.salvageGearId = this.salvageGearId === gearId ? null : gearId;
        }

        handlers.onSelectionChange();
      });
    });

    const fuseBtn = container.querySelector('[data-forge-fuse]');
    fuseBtn?.addEventListener('click', () => {
      handlers.onFuse([...this.selectedIds]);
    });

    const salvageBtn = container.querySelector('[data-forge-salvage]');
    salvageBtn?.addEventListener('click', () => {
      if (!this.salvageGearId) return;
      handlers.onSalvage(this.salvageGearId);
    });
  }

  clearAfterFuse(): void {
    this.selectedIds.clear();
  }

  clearAfterSalvage(): void {
    this.salvageGearId = null;
  }
}
