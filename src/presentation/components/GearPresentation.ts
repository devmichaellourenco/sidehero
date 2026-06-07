import { GearDto, HeroDto } from '../../application/dto/GameStateDto';
import {
  getGearFrameSprite,
  getGearRaritySprite,
  getGearSlotSprite,
  imgTag,
} from '../assets/AssetCatalog';

export const GEAR_SLOTS = ['weapon', 'armor', 'accessory'] as const;
export type GearSlotKey = (typeof GEAR_SLOTS)[number];

export const GEAR_SLOT_LABELS: Record<GearSlotKey, string> = {
  weapon: 'Arma',
  armor: 'Armadura',
  accessory: 'Acessório',
};

export interface EquippedGearDto {
  id: string;
  name: string;
  slot: string;
  rarity: string;
}

export function getHeroEquipment(
  hero: HeroDto,
  slot: GearSlotKey,
): EquippedGearDto | null {
  const gear = hero.equipment[slot];
  return gear ?? null;
}

export function renderEquipmentSlot(
  slot: GearSlotKey,
  gear: EquippedGearDto | null,
  options: {
    heroId: string;
    compact?: boolean;
    clickable?: boolean;
  },
): string {
  const label = GEAR_SLOT_LABELS[slot];
  const compactClass = options.compact ? ' equipment-slot-compact' : '';
  const clickableClass = options.clickable === false ? '' : ' equipment-slot-clickable';
  const frameUrl = gear ? getGearFrameSprite(gear.rarity) : getGearFrameSprite('common');
  const icon = gear
    ? imgTag(getGearSlotSprite(gear.slot), gear.name, 'equipment-slot-icon')
    : imgTag(getGearSlotSprite(slot), label, 'equipment-slot-icon equipment-slot-empty');

  const rarityIcon = gear
    ? imgTag(getGearRaritySprite(gear.rarity), gear.rarity, 'equipment-slot-rarity')
    : '';

  const title = gear ? `${label}: ${gear.name}` : `${label}: vazio`;

  return `
    <button
      type="button"
      class="equipment-slot${compactClass}${clickableClass} ${gear?.rarity ?? 'empty'}"
      data-hero="${options.heroId}"
      data-slot="${slot}"
      title="${title}"
      style="--slot-frame: url('${frameUrl}')"
    >
      <span class="equipment-slot-label">${label}</span>
      <span class="equipment-slot-icon-wrap">
        ${icon}
        ${rarityIcon}
      </span>
      ${gear ? `<span class="equipment-slot-name">${gear.name}</span>` : ''}
    </button>
  `;
}

export function renderHeroEquipmentRow(hero: HeroDto, compact = true): string {
  return `
    <div class="equipment-slots-row">
      ${GEAR_SLOTS.map((slot) =>
        renderEquipmentSlot(slot, getHeroEquipment(hero, slot), {
          heroId: hero.id,
          compact,
        }),
      ).join('')}
    </div>
  `;
}

export function renderGearCard(
  gear: GearDto,
  options: {
    actionLabel?: string;
    actionDataAttrs?: Record<string, string>;
    showAction?: boolean;
  } = {},
): string {
  const frameUrl = getGearFrameSprite(gear.rarity);
  const actionLabel = options.actionLabel ?? 'Equipar';
  const showAction = options.showAction !== false;

  const dataAttrs = Object.entries(options.actionDataAttrs ?? { 'data-gear': gear.id })
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  return `
    <div class="gear-item ${gear.rarity}" style="--gear-frame: url('${frameUrl}')">
      <div class="gear-item-main">
        <div class="gear-icon-wrap">
          ${imgTag(getGearSlotSprite(gear.slot), gear.slot, 'gear-slot-icon')}
          ${imgTag(getGearRaritySprite(gear.rarity), gear.rarity, 'gear-rarity-icon')}
        </div>
        <div class="gear-item-info">
          <strong>${gear.name}</strong>
          <span class="gear-slot-tag">${GEAR_SLOT_LABELS[gear.slot as GearSlotKey] ?? gear.slot}</span>
          <span>+${gear.attackBonus} ATK · +${gear.defenseBonus} DEF · +${gear.healthBonus} HP</span>
        </div>
      </div>
      ${
        showAction
          ? `<button type="button" class="gear-equip-btn" ${dataAttrs}>${actionLabel}</button>`
          : ''
      }
    </div>
  `;
}

export function formatGearBonuses(gear: GearDto): string {
  return `+${gear.attackBonus} ATK · +${gear.defenseBonus} DEF · +${gear.healthBonus} HP`;
}
