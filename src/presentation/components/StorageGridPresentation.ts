import { GearDto } from '../../application/dto/GameStateDto';
import {
  getGearFrameSprite,
  getGearRaritySprite,
  getGearSlotSprite,
  getGearSprite,
  imgTag,
} from '../assets/AssetCatalog';
import {
  renderGearBonusLines,
  GEAR_RARITY_LABELS,
  GEAR_SLOT_LABELS,
  GearSlotKey,
} from './GearPresentation';
import { gearRaritySurfaceClass } from './GearRarityPresentation';
import { gearDragAttr } from '../gear/GearDragDropBinder';
import { renderInventoryGearAction } from './InventoryGearActionPresentation';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderStorageTooltipActions(
  gear: GearDto,
  options: {
    location: 'inventory' | 'stash';
    canStash?: boolean;
    canWithdraw?: boolean;
  },
): string {
  const actions: string[] = [];

  if (options.location === 'inventory' && options.canStash) {
    actions.push(
      renderInventoryGearAction(
        'stash',
        'Guardar no baú',
        `data-move-to-stash="${escapeHtml(gear.id)}"`,
      ),
    );
  }

  if (options.location === 'stash' && options.canWithdraw) {
    actions.push(
      renderInventoryGearAction(
        'withdraw',
        'Retirar',
        `data-move-from-stash="${escapeHtml(gear.id)}"`,
      ),
    );
  }

  actions.push(
    renderInventoryGearAction(
      'destroy',
      'Destruir',
      `data-destroy-gear="${escapeHtml(gear.id)}" data-gear-location="${options.location}"`,
    ),
  );

  return actions.join('');
}

export function renderStashGridSlot(
  gear: GearDto,
  options: {
    canWithdraw: boolean;
  },
): string {
  const frameUrl = getGearFrameSprite(gear.rarity);
  const slotLabel = GEAR_SLOT_LABELS[gear.slot as GearSlotKey] ?? gear.slot;
  const rarityLabel = GEAR_RARITY_LABELS[gear.rarity] ?? gear.rarity;
  const dragAttrs =
    options.canWithdraw
      ? gearDragAttr({ kind: 'stash', gearId: gear.id, slot: gear.slot as GearSlotKey })
      : '';

  return `
    <button
      type="button"
      class="inventory-grid-slot inventory-grid-slot--stash ${gearRaritySurfaceClass(gear.rarity)}${options.canWithdraw ? '' : ' inventory-grid-slot--locked'}"
      data-stash-gear-id="${escapeHtml(gear.id)}"
      data-can-withdraw="${options.canWithdraw ? 'true' : 'false'}"
      ${dragAttrs}
      aria-label="${escapeHtml(gear.name)} · ${slotLabel} · ${rarityLabel}"
      style="--gear-frame: url('${frameUrl}')"
    >
      <span class="inventory-grid-slot-icon-wrap">
        ${imgTag(getGearSprite(gear), slotLabel, 'inventory-grid-slot-icon')}
        ${imgTag(getGearRaritySprite(gear.rarity), rarityLabel, 'inventory-grid-slot-rarity')}
      </span>
      <span class="inventory-gear-tooltip-content hidden">
        <strong class="inventory-gear-tooltip-name">${escapeHtml(gear.name)}</strong>
        <span class="inventory-gear-tooltip-meta">${slotLabel} · ${rarityLabel} · Lv.${gear.requirements.minLevel}</span>
        <span class="inventory-gear-tooltip-stats">${renderGearBonusLines(gear)}</span>
        <span class="inventory-gear-action-row">${renderStorageTooltipActions(gear, {
          location: 'stash',
          canWithdraw: options.canWithdraw,
        })}</span>
      </span>
    </button>
  `;
}

export function renderStashGrid(
  gears: GearDto[],
  options: { canWithdraw: boolean },
): string {
  if (gears.length === 0) {
    return '<p class="empty-state modal-empty">Nenhum item guardado no baú.</p>';
  }

  return `
    <div class="inventory-grid stash-grid" data-stash-grid data-drop-zone="stash">
      ${gears.map((gear) => renderStashGridSlot(gear, options)).join('')}
    </div>
  `;
}

export function renderInventoryStorageActions(
  gear: GearDto,
  options: { canStash: boolean },
): string {
  return renderStorageTooltipActions(gear, {
    location: 'inventory',
    canStash: options.canStash,
  });
}
