import { GameStateDto } from '../../application/dto/GameStateDto';
import {
  GEAR_SLOT_LABELS,
  GearSlotKey,
  getHeroEquipment,
  renderEquippedGearCard,
  renderGearCard,
} from './GearPresentation';
import { getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { renderInlineComparison } from './GearComparison';

export type EquipPickerMode =
  | { type: 'slot'; heroId: string; slot: GearSlotKey }
  | { type: 'gear'; gearId: string };

export type EquipPickerHandlers = {
  onSelectGear: (heroId: string, gearId: string) => void;
  onSelectHero: (heroId: string, gearId: string) => void;
  onUnequip: (heroId: string, slot: GearSlotKey) => void;
};

export class EquipPickerModalRenderer {
  render(
    container: HTMLElement,
    state: GameStateDto,
    mode: EquipPickerMode,
    handlers: EquipPickerHandlers,
  ): void {
    if (mode.type === 'slot') {
      this.renderSlotPicker(container, state, mode.heroId, mode.slot, handlers);
      return;
    }

    this.renderHeroPicker(container, state, mode.gearId, handlers);
  }

  private renderSlotPicker(
    container: HTMLElement,
    state: GameStateDto,
    heroId: string,
    slot: GearSlotKey,
    handlers: EquipPickerHandlers,
  ): void {
    const hero = state.heroes.find((entry) => entry.id === heroId);
    const compatible = state.inventory.filter((gear) => gear.slot === slot);
    const equipped = hero ? getHeroEquipment(hero, slot) : null;

    if (!hero) {
      container.innerHTML = '<p class="empty-state">Herói não encontrado.</p>';
      return;
    }

    const equippedSection = equipped
      ? `
        <section class="equip-picker-equipped">
          <h4 class="equip-picker-section-title">Equipado agora</h4>
          ${renderEquippedGearCard(equipped, { heroId, slot })}
        </section>
      `
      : '';

    const inventorySection =
      compatible.length > 0
        ? `
        <section class="equip-picker-inventory">
          <h4 class="equip-picker-section-title">Trocar por</h4>
          <div class="modal-gear-list">
            ${compatible
              .map((gear) =>
                renderGearCard(gear, {
                  actionLabel: 'Equipar',
                  actionDataAttrs: {
                    'data-pick-gear': gear.id,
                    'data-pick-hero': heroId,
                  },
                  extraContent: renderInlineComparison(gear, equipped),
                }),
              )
              .join('')}
          </div>
        </section>
      `
        : `
        <p class="empty-state modal-empty equip-picker-empty">
          Nenhum ${GEAR_SLOT_LABELS[slot].toLowerCase()} disponível no inventário para trocar.
        </p>
      `;

    container.innerHTML = `
      <p class="equip-picker-context">
        ${GEAR_SLOT_LABELS[slot]} de <strong>${hero.name}</strong>
      </p>
      ${equippedSection}
      ${inventorySection}
    `;

    container.querySelectorAll('[data-pick-gear]').forEach((button) => {
      button.addEventListener('click', () => {
        const gearId = button.getAttribute('data-pick-gear');
        const targetHeroId = button.getAttribute('data-pick-hero');
        if (gearId && targetHeroId) {
          handlers.onSelectGear(targetHeroId, gearId);
        }
      });
    });

    container.querySelectorAll('[data-unequip-hero]').forEach((button) => {
      button.addEventListener('click', () => {
        const targetHeroId = button.getAttribute('data-unequip-hero');
        const unequipSlot = button.getAttribute('data-unequip-slot') as GearSlotKey | null;
        if (targetHeroId && unequipSlot) {
          handlers.onUnequip(targetHeroId, unequipSlot);
        }
      });
    });
  }

  private renderHeroPicker(
    container: HTMLElement,
    state: GameStateDto,
    gearId: string,
    handlers: EquipPickerHandlers,
  ): void {
    const gear = state.inventory.find((entry) => entry.id === gearId);

    if (!gear) {
      container.innerHTML = '<p class="empty-state">Item não encontrado no inventário.</p>';
      return;
    }

    container.innerHTML = `
      <div class="equip-picker-gear-preview">
        ${renderGearCard(gear, { showAction: false })}
      </div>
      <p class="equip-picker-context">Em qual herói deseja equipar?</p>
      <div class="equip-hero-picker">
        ${state.heroes
          .map((hero) => {
            const equipped = getHeroEquipment(hero, gear.slot as GearSlotKey);
            const comparison = renderInlineComparison(gear, equipped);

            return `
              <button type="button" class="equip-hero-card" data-pick-hero="${hero.id}" data-pick-gear="${gearId}">
                ${imgTag(getHeroSprite(hero.heroClass), hero.name, 'equip-hero-card-icon')}
                <span class="equip-hero-card-name">${hero.name}</span>
                <span class="equip-hero-card-level">Lv.${hero.level}</span>
                <div class="equip-hero-card-comparison">${comparison}</div>
              </button>
            `;
          })
          .join('')}
      </div>
    `;

    container.querySelectorAll('[data-pick-hero]').forEach((button) => {
      button.addEventListener('click', () => {
        const heroId = button.getAttribute('data-pick-hero');
        const selectedGearId = button.getAttribute('data-pick-gear');
        if (heroId && selectedGearId) {
          handlers.onSelectHero(heroId, selectedGearId);
        }
      });
    });
  }
}
