import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import {
  countUpgradeItems,
  getGearUpgradeInfoForActiveParty,
  getGearUpgradeInfoForHero,
  sortGearForHero,
} from './GearComparison';
import { GEAR_SLOT_LABELS, GearSlotKey } from './GearPresentation';
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
  onSortChange: (mode: InventorySortMode) => void;
  onHeroChange: (heroId: string) => void;
  onUpgradesOnlyChange: (enabled: boolean) => void;
  onOptimizeLoadout: () => void;
  onOpenStash: () => void;
};

export class InventoryModalRenderer {
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

  renderEmbedded(
    container: HTMLElement,
    state: GameStateDto,
    heroId: string,
    handlers: InventoryModalHandlers,
    options: {
      showOptimize?: boolean;
      inlineActiveSlot?: { heroId: string; slot: GearSlotKey } | null;
      canEditGear?: boolean;
    } = {},
  ): void {
    this.selectedHeroId = heroId;
    this.renderPanel(container, state, heroId, handlers, { ...options, embedded: true });
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
    this.renderPanel(container, state, selectedHeroId, handlers, options);
  }

  private renderPanel(
    container: HTMLElement,
    state: GameStateDto,
    selectedHeroId: string,
    handlers: InventoryModalHandlers,
    options: {
      showOptimize?: boolean;
      inlineActiveSlot?: { heroId: string; slot: GearSlotKey } | null;
      canEditGear?: boolean;
      embedded?: boolean;
    } = {},
  ): void {
    const embedded = options.embedded === true;
    const inlineActive = options.inlineActiveSlot;
    const slotPicking =
      Boolean(inlineActive) && inlineActive!.heroId === selectedHeroId;
    const activeSlot = slotPicking ? inlineActive!.slot : null;

    const inventoryIcon = getAssetUrl(ASSETS.ui.inventory);
    const filteredBySlot = activeSlot
      ? state.inventory.filter((gear) => gear.slot === activeSlot)
      : state.inventory;

    const filtered = this.upgradesOnly
      ? filteredBySlot.filter((gear) =>
          activeSlot
            ? getGearUpgradeInfoForHero(state, gear, selectedHeroId).status === 'upgrade'
            : getGearUpgradeInfoForActiveParty(state, gear).status === 'upgrade',
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
    const loadoutContext = slotPicking ? ('equip-picker' as const) : ('inventory' as const);
    const heroLoadout =
      !embedded && selectedHero
        ? renderInventoryHeroLoadout(selectedHero, {
            feedback: equipFeedback,
            heroPulse: this.heroChangePulse,
            context: loadoutContext,
            activeSlot: activeSlot ?? undefined,
            dragDrop: canEditGear,
          })
        : '';
    const inlineEquipHost = embedded
      ? ''
      : '<div class="inline-equip-host hidden" data-inline-equip-host aria-live="polite"></div>';

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

    const heroSelector = embedded ? '' : renderInventoryHeroSelector(state, selectedHeroId);
    const slotLabel = activeSlot ? GEAR_SLOT_LABELS[activeSlot] : null;
    const countLabel = activeSlot
      ? `<p class="inventory-count">${filtered.length} ${slotLabel!.toLowerCase()}${filtered.length === 1 ? '' : 's'} disponíve${filtered.length === 1 ? 'l' : 'is'}</p>`
      : `<p class="inventory-count">${state.storageCapacity.inventoryUsed} / ${state.storageCapacity.inventoryLimit} itens · ${filtered.length} visíveis</p>`;
    const slotContextHeader = activeSlot
      ? `<p class="inventory-slot-context">Escolha ${slotLabel!.toLowerCase()}</p>`
      : '';
    const canStash =
      state.storageCapacity.stashUnlocked &&
      state.storageCapacity.stashUsed < state.storageCapacity.stashLimit;
    const panelClass = [
      'inventory-panel',
      embedded ? 'inventory-panel--embedded' : '',
      slotPicking ? 'inventory-panel--slot-active' : '',
    ]
      .filter(Boolean)
      .join(' ');

    if (state.inventory.length === 0) {
      container.innerHTML = `
        <div class="${panelClass}">
          ${heroSelector}
          ${heroLoadout}
          ${inlineEquipHost}
          ${sortButtons}
          <p class="empty-state modal-empty">
            ${imgTag(inventoryIcon, 'Inventário', 'stat-icon')}
            Nenhum item ainda. Derrote inimigos e abra baús!
          </p>
          <footer class="inventory-footer">${optimizeButton}</footer>
        </div>
      `;
      this.previousRenderState = state;
      this.heroChangePulse = false;
      this.bind(container, handlers, embedded);
      bindEquipmentTooltips(container);
      return;
    }

    const mainGridSection =
      sorted.length > 0
        ? renderInventoryGrid(state, sorted, selectedHeroId, {
            returnedGearIds: equipFeedback?.returnedGearIds,
            equipMode: slotPicking ? 'pick' : 'inventory',
            upgradeForHeroId: slotPicking ? selectedHeroId : undefined,
            canStash: slotPicking ? undefined : canStash,
          })
        : activeSlot
          ? `<p class="empty-state modal-empty">Nenhum ${slotLabel!.toLowerCase()} disponível no inventário.</p>`
          : '';

    container.innerHTML = `
      <div class="${panelClass}">
        ${heroSelector}
        ${heroLoadout}
        ${inlineEquipHost}
        ${slotContextHeader}
        ${sortButtons}
        ${countLabel}
        ${mainGridSection}
        <footer class="inventory-footer">${optimizeButton}</footer>
      </div>
    `;

    this.previousRenderState = state;
    this.heroChangePulse = false;
    this.bind(container, handlers, embedded);
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

  private bind(container: HTMLElement, handlers: InventoryModalHandlers, embedded = false): void {
    container.querySelectorAll('[data-sort]').forEach((button) => {
      button.addEventListener('click', () => {
        const sort = button.getAttribute('data-sort') as InventorySortMode;
        this.sortMode = sort;
        handlers.onSortChange(sort);
      });
    });

    if (!embedded) {
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
    }

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
    this.sortMode = 'gain';
    this.selectedHeroId = null;
    this.upgradesOnly = false;
    this.previousRenderState = null;
    this.heroChangePulse = false;
  }
}
