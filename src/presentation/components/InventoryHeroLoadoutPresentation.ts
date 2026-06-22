import { HeroDto } from '../../application/dto/GameStateDto';
import {
  ASSETS,
  getAssetUrl,
  getGearFrameSprite,
  getGearRaritySprite,
  getGearSlotSprite,
  getHeroSprite,
  imgTag,
} from '../assets/AssetCatalog';
import {
  GEAR_SLOT_LABELS,
  GearSlotKey,
  getHeroEquipment,
  renderEquipmentSlotTooltip,
} from './GearPresentation';
import { InventoryEquipFeedback } from './InventoryEquipFeedback';

export type HeroLoadoutContext = 'inventory' | 'equip-picker';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInventoryLoadoutSlot(
  hero: HeroDto,
  slot: GearSlotKey,
  options: {
    feedback: InventoryEquipFeedback | null;
    context: HeroLoadoutContext;
    activeSlot?: GearSlotKey;
  },
): string {
  const label = GEAR_SLOT_LABELS[slot];
  const gear = getHeroEquipment(hero, slot);
  const frameUrl = gear ? getGearFrameSprite(gear.rarity) : getGearFrameSprite('common');
  const isNew = options.feedback?.newSlots[slot] === gear?.id;
  const isCleared = options.feedback?.clearedSlots.includes(slot) ?? false;
  const isActiveSlot = options.context === 'equip-picker' && slot === options.activeSlot;
  const highlightClass = isNew
    ? ' inventory-loadout-slot--equipped-new'
    : isCleared
      ? ' inventory-loadout-slot--cleared'
      : '';
  const activeClass = isActiveSlot ? ' inventory-loadout-slot--active' : '';

  const icon = gear
    ? imgTag(getGearSlotSprite(gear.slot), gear.name, 'equipment-slot-icon')
    : imgTag(getGearSlotSprite(slot), label, 'equipment-slot-icon equipment-slot-empty');

  const rarityIcon = gear
    ? imgTag(getGearRaritySprite(gear.rarity), gear.rarity, 'equipment-slot-rarity')
    : '';

  let slotAttrs = '';
  let extraClasses = '';

  if (options.context === 'inventory') {
    if (gear) {
      slotAttrs = `data-inventory-unequip-hero="${escapeHtml(hero.id)}" data-inventory-unequip-slot="${slot}"`;
    }
  } else if (isActiveSlot && gear) {
    slotAttrs = `data-unequip-hero="${escapeHtml(hero.id)}" data-unequip-slot="${slot}"`;
  } else if (!isActiveSlot) {
    slotAttrs = `data-hero="${escapeHtml(hero.id)}" data-slot="${slot}"`;
    extraClasses = ' equipment-slot-clickable';
  }

  const ariaLabel = gear
    ? isActiveSlot
      ? `Desequipar ${gear.name}`
      : `${gear.name} · ${label}`
    : `${label}: vazio`;

  return `
    <button
      type="button"
      class="equipment-slot equipment-slot--icon-only inventory-loadout-slot${gear ? ' inventory-loadout-slot--filled' : ' inventory-loadout-slot--empty'}${highlightClass}${activeClass}${extraClasses} ${gear?.rarity ?? 'empty'}"
      ${slotAttrs}
      aria-label="${escapeHtml(ariaLabel)}"
      style="--slot-frame: url('${frameUrl}')"
    >
      <span class="equipment-slot-icon-wrap">
        ${icon}
        ${rarityIcon}
      </span>
      ${renderEquipmentSlotTooltip(slot, gear)}
    </button>
  `;
}

export function renderInventoryHeroLoadout(
  hero: HeroDto,
  options: {
    feedback?: InventoryEquipFeedback | null;
    heroPulse?: boolean;
    context?: HeroLoadoutContext;
    activeSlot?: GearSlotKey;
  } = {},
): string {
  const glowUrl = getAssetUrl(ASSETS.characters.glow);
  const feedback = options.feedback ?? null;
  const pulseClass = options.heroPulse ? ' inventory-loadout--hero-changed' : '';
  const context = options.context ?? 'inventory';

  return `
    <section class="inventory-loadout${pulseClass}" aria-label="Equipamento de ${escapeHtml(hero.name)}">
      <div class="inventory-loadout-portrait">
        <img class="inventory-loadout-glow" src="${glowUrl}" alt="" aria-hidden="true" />
        ${imgTag(getHeroSprite(hero), hero.name, 'inventory-loadout-sprite')}
        <div class="inventory-loadout-hero-meta">
          <strong class="inventory-loadout-hero-name">${escapeHtml(hero.name)}</strong>
          <span class="inventory-loadout-hero-level">Lv.${hero.level}</span>
        </div>
      </div>
      <div class="inventory-loadout-slots equipment-slots-row">
        ${(['weapon', 'armor', 'accessory'] as GearSlotKey[])
          .map((slot) =>
            renderInventoryLoadoutSlot(hero, slot, {
              feedback,
              context,
              activeSlot: options.activeSlot,
            }),
          )
          .join('')}
      </div>
    </section>
  `;
}
