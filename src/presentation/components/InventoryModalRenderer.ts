import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import {
  countUpgradeItems,
  getGearUpgradeInfoForActiveParty,
  sortGearForHero,
} from './GearComparison';
import { GEAR_SLOTS, GEAR_SLOT_LABELS, GearSlotKey } from './GearPresentation';
import { bindEquipmentTooltips } from './EquipmentTooltipBinder';
import {
  bindInventoryGearTooltips,
  hideInventoryGearTooltip,
} from './InventoryGearTooltipBinder';
import { computeInventoryEquipFeedback } from './InventoryEquipFeedback';
import {
  renderInventoryGrid,
  renderInventoryHeroSelector,
  resolveDefaultInventoryHeroId,
} from './InventoryGridPresentation';
import { renderInventoryHeroLoadout } from './InventoryHeroLoadoutPresentation';

export type InventorySortMode = 'gain' | 'name' | 'rarity';

export type InventoryModalHandlers = {
  onEquipGear: (gearId: string, heroId: string) => void;
  onUnequipGear: (heroId: string, slot: GearSlotKey) => void;
  onSlotClick: (heroId: string, slot: GearSlotKey) => void;
  onFilterChange: (slot: GearSlotKey | 'all') => void;
  onSortChange: (mode: InventorySortMode) => void;
  onHeroChange: (heroId: string) => void;
  onUpgradesOnlyChange: (enabled: boolean) => void;
  onOptimizeLoadout: () => void;
  onOpenStash: () => void;
};

export class InventoryModalRenderer {
  private activeFilter: GearSlotKey | 'all' = 'all';
  private sortMode: InventorySortMode = 'gain';
  private selectedHeroId: string | null = null;
  private upgradesOnly = false;
  private previousRenderState: GameStateDto | null = null;
  private heroChangePulse = false;

  getSelectedHeroId(state: GameStateDto): string {
    if (
      this.selectedHeroId &&
      state.heroes.some((hero) => hero.id === this.selectedHeroId)
    ) {
      return this.selectedHeroId;
    }

    return resolveDefaultInventoryHeroId(state);
  }

  render(
    container: HTMLElement,
    state: GameStateDto,
    handlers: InventoryModalHandlers,
    options: {
      showOptimize?: boolean;
      inlineActiveSlot?: { heroId: string; slot: GearSlotKey } | null;
      canEditGear?: boolean;
    } = {},
  ): void {
    hideInventoryGearTooltip();

    const selectedHeroId = this.getSelectedHeroId(state);
    this.selectedHeroId = selectedHeroId;

    const inventoryIcon = getAssetUrl(ASSETS.ui.inventory);
    const filteredBySlot =
      this.activeFilter === 'all'
        ? state.inventory
        : state.inventory.filter((gear) => gear.slot === this.activeFilter);

    const filtered = this.upgradesOnly
      ? filteredBySlot.filter(
          (gear) =>
            getGearUpgradeInfoForActiveParty(state, gear).status === 'upgrade',
        )
      : filteredBySlot;

    const sorted = this.sortInventory(state, filtered, selectedHeroId);
    const upgradeCount = countUpgradeItems(state);
    const selectedHero = state.heroes.find((hero) => hero.id === selectedHeroId);
    const equipFeedback = computeInventoryEquipFeedback(
      this.previousRenderState,
      state,
      selectedHeroId,
    );
    const canEditGear = options.canEditGear !== false;
    const inlineActive = options.inlineActiveSlot;
    const loadoutContext =
      inlineActive?.heroId === selectedHeroId ? ('equip-picker' as const) : ('inventory' as const);
    const heroLoadout = selectedHero
      ? renderInventoryHeroLoadout(selectedHero, {
          feedback: equipFeedback,
          heroPulse: this.heroChangePulse,
          context: loadoutContext,
          activeSlot:
            inlineActive?.heroId === selectedHeroId ? inlineActive.slot : undefined,
          dragDrop: canEditGear,
        })
      : '';
    const inlineEquipHost = '<div class="inline-equip-host hidden" data-inline-equip-host aria-live="polite"></div>';

    const optimizeButton =
      options.showOptimize === false
        ? '<p class="inventory-optimize-locked">Otimizar equipe: desbloqueie em Melhorias.</p>'
        : `
      <button
        type="button"
        class="gear-equip-btn inventory-optimize-btn"
        data-optimize-loadout
        ${upgradeCount === 0 ? 'disabled' : ''}
      >
        Otimizar equipe${upgradeCount > 0 ? ` (↑${upgradeCount})` : ''}
      </button>
    `;

    const filterButtons = `
      <div class="modal-filters inventory-filters">
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
      <div class="inventory-toolbar-row">
        <div class="modal-sort">
          <span class="modal-sort-label">Ordenar:</span>
          <button type="button" class="filter-btn ${this.sortMode === 'gain' ? 'active' : ''}" data-sort="gain">Ganho</button>
          <button type="button" class="filter-btn ${this.sortMode === 'rarity' ? 'active' : ''}" data-sort="rarity">Raridade</button>
          <button type="button" class="filter-btn ${this.sortMode === 'name' ? 'active' : ''}" data-sort="name">Nome</button>
        </div>
        <button
          type="button"
          class="filter-btn inventory-upgrades-toggle ${this.upgradesOnly ? 'active' : ''}"
          data-upgrades-only
          aria-pressed="${this.upgradesOnly ? 'true' : 'false'}"
        >
          Só upgrades
        </button>
        ${
          state.storageCapacity.stashUnlocked
            ? `<button type="button" class="filter-btn" data-open-stash>Baú (${state.storageCapacity.stashUsed}/${state.storageCapacity.stashLimit})</button>`
            : ''
        }
      </div>
    `;

    const heroSelector = renderInventoryHeroSelector(state, selectedHeroId);
    const countLabel = `<p class="inventory-count">${state.storageCapacity.inventoryUsed} / ${state.storageCapacity.inventoryLimit} itens · ${filtered.length} visíveis</p>`;
    const canStash =
      state.storageCapacity.stashUnlocked &&
      state.storageCapacity.stashUsed < state.storageCapacity.stashLimit;
    const inlineSlotPickerOpen = Boolean(
      inlineActive && inlineActive.heroId === selectedHeroId,
    );
    const panelClass = inlineSlotPickerOpen
      ? 'inventory-panel inventory-panel--slot-picking'
      : 'inventory-panel';
    const toolbarSection = inlineSlotPickerOpen
      ? ''
      : `${filterButtons}${sortButtons}`;
    const countSection = inlineSlotPickerOpen ? '' : countLabel;

    if (state.inventory.length === 0) {
      container.innerHTML = `
        <div class="${panelClass}">
          ${heroSelector}
          ${heroLoadout}
          ${inlineEquipHost}
          ${toolbarSection}
          <p class="empty-state modal-empty">
            ${imgTag(inventoryIcon, 'Inventário', 'stat-icon')}
            Nenhum item ainda. Derrote inimigos e abra baús!
          </p>
          <footer class="inventory-footer">${optimizeButton}</footer>
        </div>
      `;
      this.previousRenderState = state;
      this.heroChangePulse = false;
      this.bind(container, handlers);
      bindEquipmentTooltips(container);
      return;
    }

    const mainGridSection = inlineSlotPickerOpen
      ? ''
      : renderInventoryGrid(state, sorted, selectedHeroId, {
          returnedGearIds: equipFeedback?.returnedGearIds,
          canStash,
        });

    container.innerHTML = `
      <div class="${panelClass}">
        ${heroSelector}
        ${heroLoadout}
        ${inlineEquipHost}
        ${toolbarSection}
        ${countSection}
        ${mainGridSection}
        <footer class="inventory-footer">${optimizeButton}</footer>
      </div>
    `;

    this.previousRenderState = state;
    this.heroChangePulse = false;
    this.bind(container, handlers);
    bindInventoryGearTooltips(container);
    bindEquipmentTooltips(container);
  }

  private sortInventory(
    state: GameStateDto,
    gears: GameStateDto['inventory'],
    heroId: string,
  ): GameStateDto['inventory'] {
    if (this.sortMode === 'gain') {
      return sortGearForHero(state, gears, heroId);
    }

    if (this.sortMode === 'rarity') {
      const rarityRank: Record<string, number> = { epic: 3, rare: 2, common: 1 };
      return [...gears].sort((left, right) => {
        const leftRank = rarityRank[left.rarity] ?? 0;
        const rightRank = rarityRank[right.rarity] ?? 0;
        if (rightRank !== leftRank) return rightRank - leftRank;
        return left.name.localeCompare(right.name, 'pt-BR');
      });
    }

    return [...gears].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
  }

  private bind(container: HTMLElement, handlers: InventoryModalHandlers): void {
    container.querySelectorAll('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter') as GearSlotKey | 'all';
        this.activeFilter = filter;
        handlers.onFilterChange(filter);
      });
    });

    container.querySelectorAll('[data-sort]').forEach((button) => {
      button.addEventListener('click', () => {
        const sort = button.getAttribute('data-sort') as InventorySortMode;
        this.sortMode = sort;
        handlers.onSortChange(sort);
      });
    });

    container.querySelectorAll('[data-inventory-hero]').forEach((button) => {
      button.addEventListener('click', () => {
        const heroId = button.getAttribute('data-inventory-hero');
        if (!heroId) return;
        if (heroId !== this.selectedHeroId) {
          this.heroChangePulse = true;
        }
        this.selectedHeroId = heroId;
        handlers.onHeroChange(heroId);
      });
    });

    container.querySelector('[data-upgrades-only]')?.addEventListener('click', () => {
      this.upgradesOnly = !this.upgradesOnly;
      handlers.onUpgradesOnlyChange(this.upgradesOnly);
    });

    container.querySelector('[data-open-stash]')?.addEventListener('click', () => {
      handlers.onOpenStash();
    });

    container.querySelectorAll('[data-inventory-unequip-hero]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const heroId = button.getAttribute('data-inventory-unequip-hero');
        const slot = button.getAttribute('data-inventory-unequip-slot') as GearSlotKey | null;
        if (!heroId || !slot) return;
        handlers.onUnequipGear(heroId, slot);
      });
    });

    container.querySelectorAll('.inventory-loadout-slot[data-hero][data-slot]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const heroId = button.getAttribute('data-hero');
        const slot = button.getAttribute('data-slot') as GearSlotKey | null;
        if (!heroId || !slot) return;
        handlers.onSlotClick(heroId, slot);
      });
    });

    container.querySelectorAll('[data-inventory-gear-id]').forEach((slot) => {
      slot.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.closest('[data-inventory-equip]')) return;

        if (slot.getAttribute('data-can-equip') !== 'true') return;

        const gearId = slot.getAttribute('data-inventory-gear-id');
        const heroId = slot.getAttribute('data-inventory-equip-hero');
        if (!gearId || !heroId) return;

        handlers.onEquipGear(gearId, heroId);
      });
    });
  }

  resetFilter(): void {
    this.activeFilter = 'all';
    this.sortMode = 'gain';
    this.selectedHeroId = null;
    this.upgradesOnly = false;
    this.previousRenderState = null;
    this.heroChangePulse = false;
  }
}
