import { GearDto, HeroDto } from '../../application/dto/GameStateDto';
import {
  getGearFrameSprite,
  getGearRaritySprite,
  getGearSlotSprite,
  imgTag,
} from '../assets/AssetCatalog';
import { canHeroEquipGear } from '../../application/mappers/GearRequirementPresentationMapper';
import { renderGearRequirementLines } from './GearRequirementPresentation';

export const GEAR_SLOTS = ['weapon', 'armor', 'accessory'] as const;
export type GearSlotKey = (typeof GEAR_SLOTS)[number];

export const GEAR_SLOT_LABELS: Record<GearSlotKey, string> = {
  weapon: 'Arma',
  armor: 'Armadura',
  accessory: 'Acessório',
};

export const GEAR_RARITY_LABELS: Record<string, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
  mythic: 'Mítico',
};

export interface EquippedGearDto {
  id: string;
  name: string;
  slot: string;
  rarity: string;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  attackSpeedBonus?: number;
  castSpeedBonus?: number;
  critChanceBonus?: number;
  critDamageBonus?: number;
  fireResistBonus?: number;
  coldResistBonus?: number;
  lightningResistBonus?: number;
  chaosResistBonus?: number;
  allElementalResistBonus?: number;
}

function formatResistBonuses(
  gear: Pick<
    GearDto,
    | 'fireResistBonus'
    | 'coldResistBonus'
    | 'lightningResistBonus'
    | 'chaosResistBonus'
    | 'allElementalResistBonus'
  >,
): string[] {
  const parts: string[] = [];
  if (gear.fireResistBonus > 0) parts.push(`+${gear.fireResistBonus}% Fogo`);
  if (gear.coldResistBonus > 0) parts.push(`+${gear.coldResistBonus}% Gelo`);
  if (gear.lightningResistBonus > 0) parts.push(`+${gear.lightningResistBonus}% Raio`);
  if (gear.chaosResistBonus > 0) parts.push(`+${gear.chaosResistBonus}% Caos`);
  if (gear.allElementalResistBonus > 0) parts.push(`+${gear.allElementalResistBonus}% Elemental`);
  return parts;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPercent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

export function formatGearBonuses(
  gear: Pick<
    GearDto,
    | 'attackBonus'
    | 'defenseBonus'
    | 'healthBonus'
    | 'attackSpeedBonus'
    | 'castSpeedBonus'
    | 'critChanceBonus'
    | 'critDamageBonus'
    | 'fireResistBonus'
    | 'coldResistBonus'
    | 'lightningResistBonus'
    | 'chaosResistBonus'
    | 'allElementalResistBonus'
    | 'dodgeChanceBonus'
    | 'blockChanceBonus'
    | 'damageReductionBonus'
  >,
): string {
  const parts = [
    `+${gear.attackBonus} ATK`,
    `+${gear.defenseBonus} DEF`,
    `+${gear.healthBonus} HP`,
  ];

  if (gear.attackSpeedBonus > 0) parts.push(`+${gear.attackSpeedBonus.toFixed(2)} ASPD`);
  if (gear.castSpeedBonus > 0) parts.push(`+${gear.castSpeedBonus.toFixed(2)} Cast`);
  if (gear.critChanceBonus > 0) parts.push(`+${formatPercent(gear.critChanceBonus)} Crít`);
  if (gear.critDamageBonus > 0) parts.push(`+${formatPercent(gear.critDamageBonus)} Crít Dmg`);
  if (gear.dodgeChanceBonus > 0) parts.push(`+${formatPercent(gear.dodgeChanceBonus)} Esquiva`);
  if (gear.blockChanceBonus > 0) parts.push(`+${formatPercent(gear.blockChanceBonus)} Bloqueio`);
  if (gear.damageReductionBonus > 0) {
    parts.push(`+${formatPercent(gear.damageReductionBonus)} Red. Dano`);
  }
  parts.push(...formatResistBonuses(gear));

  return parts.join(' · ');
}

export function renderEquipmentSlotTooltip(
  slot: GearSlotKey,
  gear: EquippedGearDto | null,
): string {
  const slotLabel = GEAR_SLOT_LABELS[slot];

  if (gear) {
    const rarityLabel = GEAR_RARITY_LABELS[gear.rarity] ?? gear.rarity;

    return `
      <span class="equipment-slot-tooltip" role="tooltip">
        <strong class="equipment-slot-tooltip-name">${escapeHtml(gear.name)}</strong>
        <span class="equipment-slot-tooltip-meta">${slotLabel} · ${rarityLabel}</span>
        <span class="equipment-slot-tooltip-stats">${formatGearBonuses(gear)}</span>
      </span>
    `;
  }

  return `
    <span class="equipment-slot-tooltip" role="tooltip">
      <strong class="equipment-slot-tooltip-name">${slotLabel}</strong>
      <span class="equipment-slot-tooltip-meta">Vazio</span>
      <span class="equipment-slot-tooltip-stats">Clique para equipar</span>
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
    clickable?: boolean;
    variant?: 'default' | 'loadout';
  },
): string {
  const label = GEAR_SLOT_LABELS[slot];
  const variant = options.variant ?? 'default';
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
  const ariaLabel = gear
    ? `${gear.name} · ${label}`
    : `${label}: vazio — clique para equipar`;

  if (variant === 'loadout') {
    return `
      <button
        type="button"
        class="loadout-slot loadout-slot--gear equipment-slot equipment-slot--icon-only${clickableClass} ${gear?.rarity ?? 'empty'}"
        data-hero="${options.heroId}"
        data-slot="${slot}"
        aria-label="${escapeHtml(ariaLabel)}"
        style="--slot-frame: url('${frameUrl}')"
      >
        <span class="loadout-slot-icon-wrap">
          ${icon}
          ${rarityIcon}
        </span>
        ${renderEquipmentSlotTooltip(slot, gear)}
      </button>
    `;
  }

  return `
    <button
      type="button"
      class="equipment-slot equipment-slot--icon-only${clickableClass} ${gear?.rarity ?? 'empty'}"
      data-hero="${options.heroId}"
      data-slot="${slot}"
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

export function renderHeroEquipmentRow(hero: HeroDto): string {
  return `
    <div class="equipment-slots-row">
      ${GEAR_SLOTS.map((slot) =>
        renderEquipmentSlot(slot, getHeroEquipment(hero, slot), {
          heroId: hero.id,
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
    hero?: HeroDto;
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
  const canEquip = !options.hero || canHeroEquipGear(options.hero, gear);
  const showAction = options.showAction !== false && canEquip;
  const requirementSection = options.hero
    ? renderGearRequirementLines(options.hero, gear)
    : '';

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
          <span>${formatGearBonuses(gear)}</span>
          ${requirementSection}
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
      attackSpeedBonus: gear.attackSpeedBonus ?? 0,
      castSpeedBonus: gear.castSpeedBonus ?? 0,
      critChanceBonus: gear.critChanceBonus ?? 0,
      critDamageBonus: gear.critDamageBonus ?? 0,
      requirements: { minLevel: 1 },
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
