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

export const GEAR_RARITY_LABELS: Record<string, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
};

export interface EquippedGearDto {
  id: string;
  name: string;
  slot: string;
  rarity: string;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatGearBonuses(gear: Pick<GearDto, 'attackBonus' | 'defenseBonus' | 'healthBonus'>): string {
  return `+${gear.attackBonus} ATK · +${gear.defenseBonus} DEF · +${gear.healthBonus} HP`;
}

function renderEquippedGearTooltip(gear: EquippedGearDto): string {
  const slotLabel = GEAR_SLOT_LABELS[gear.slot as GearSlotKey] ?? gear.slot;
  const rarityLabel = GEAR_RARITY_LABELS[gear.rarity] ?? gear.rarity;

  return `
    <span class="equipment-slot-tooltip" role="tooltip">
      <strong class="equipment-slot-tooltip-name">${escapeHtml(gear.name)}</strong>
      <span class="equipment-slot-tooltip-meta">${slotLabel} · ${rarityLabel}</span>
      <span class="equipment-slot-tooltip-stats">${formatGearBonuses(gear)}</span>
    </span>
  `;
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
    variant?: 'default' | 'loadout';
  },
): string {
  const label = GEAR_SLOT_LABELS[slot];
  const variant = options.variant ?? 'default';
  const compactClass = options.compact ? ' equipment-slot-compact' : '';
  const clickableClass = options.clickable === false ? '' : ' equipment-slot-clickable';
  const frameUrl = gear ? getGearFrameSprite(gear.rarity) : getGearFrameSprite('common');
  const iconClass =
    variant === 'loadout' ? 'loadout-slot-icon equipment-slot-icon' : 'equipment-slot-icon';
  const icon = gear
    ? imgTag(getGearSlotSprite(gear.slot), gear.name, iconClass)
    : imgTag(getGearSlotSprite(slot), label, `${iconClass} equipment-slot-empty`);

  const rarityClass =
    variant === 'loadout' ? 'loadout-slot-rarity equipment-slot-rarity' : 'equipment-slot-rarity';
  const rarityIcon = gear ? imgTag(getGearRaritySprite(gear.rarity), gear.rarity, rarityClass) : '';

  const emptyTitle = `${label}: vazio — clique para equipar`;

  if (variant === 'loadout') {
    return `
      <button
        type="button"
        class="loadout-slot loadout-slot--gear equipment-slot${clickableClass} ${gear?.rarity ?? 'empty'}"
        data-hero="${options.heroId}"
        data-slot="${slot}"
        ${gear ? '' : `title="${emptyTitle}"`}
        style="--slot-frame: url('${frameUrl}')"
      >
        <span class="loadout-slot-icon-wrap">
          ${icon}
          ${rarityIcon}
        </span>
        ${gear ? renderEquippedGearTooltip(gear) : ''}
      </button>
    `;
  }

  return `
    <button
      type="button"
      class="equipment-slot${compactClass}${clickableClass} ${gear?.rarity ?? 'empty'}"
      data-hero="${options.heroId}"
      data-slot="${slot}"
      ${gear ? '' : `title="${emptyTitle}"`}
      style="--slot-frame: url('${frameUrl}')"
    >
      <span class="equipment-slot-label">${label}</span>
      <span class="equipment-slot-icon-wrap">
        ${icon}
        ${rarityIcon}
      </span>
      ${gear ? `<span class="equipment-slot-name">${escapeHtml(gear.name)}</span>` : ''}
      ${gear ? renderEquippedGearTooltip(gear) : ''}
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

export function renderHeroEquipmentLoadout(hero: HeroDto): string {
  return GEAR_SLOTS.map((slot) =>
    renderEquipmentSlot(slot, getHeroEquipment(hero, slot), {
      heroId: hero.id,
      variant: 'loadout',
    }),
  ).join('');
}

export function renderGearCard(
  gear: GearDto,
  options: {
    actionLabel?: string;
    actionClassName?: string;
    actionDataAttrs?: Record<string, string>;
    showAction?: boolean;
    upgradeBadge?: string;
    extraContent?: string;
  } = {},
): string {
  const frameUrl = getGearFrameSprite(gear.rarity);
  const actionLabel = options.actionLabel ?? 'Equipar';
  const actionClassName = options.actionClassName ?? 'gear-equip-btn';
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
          <div class="gear-item-title-row">
            <strong>${gear.name}</strong>
            ${options.upgradeBadge ?? ''}
          </div>
          <span class="gear-slot-tag">${GEAR_SLOT_LABELS[gear.slot as GearSlotKey] ?? gear.slot}</span>
          <span>+${gear.attackBonus} ATK · +${gear.defenseBonus} DEF · +${gear.healthBonus} HP</span>
          ${options.extraContent ?? ''}
        </div>
      </div>
      ${
        showAction
          ? `<button type="button" class="${actionClassName}" ${dataAttrs}>${actionLabel}</button>`
          : ''
      }
    </div>
  `;
}

export function renderEquippedGearCard(
  gear: EquippedGearDto,
  options: { heroId: string; slot: GearSlotKey },
): string {
  return renderGearCard(
    {
      id: gear.id,
      name: gear.name,
      slot: gear.slot,
      rarity: gear.rarity,
      attackBonus: gear.attackBonus,
      defenseBonus: gear.defenseBonus,
      healthBonus: gear.healthBonus,
    },
    {
      actionLabel: 'Desequipar',
      actionClassName: 'gear-unequip-btn',
      actionDataAttrs: {
        'data-unequip-hero': options.heroId,
        'data-unequip-slot': options.slot,
      },
    },
  );
}

