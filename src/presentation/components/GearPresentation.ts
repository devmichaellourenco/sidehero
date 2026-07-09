import { GearDto, HeroDto } from '../../application/dto/GameStateDto';
import {
  getGearFrameSprite,
  getGearRaritySprite,
  getGearSlotSprite,
  getGearSprite,
  imgTag,
} from '../assets/AssetCatalog';
import { canHeroEquipGear } from '../../application/mappers/GearRequirementPresentationMapper';
import { renderGearRequirementLines } from './GearRequirementPresentation';
import { gearDragAttr, gearDropTargetAttr } from '../gear/GearDragDropBinder';
import { GearDragSource } from '../gear/GearDragDropPolicy';

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
  templateId: string;
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
  fireDamageBonus?: number;
  coldDamageBonus?: number;
  lightningDamageBonus?: number;
  chaosDamageBonus?: number;
  allElementalDamageBonus?: number;
}

function formatSigned(value: number, suffix: string, label: string): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}${suffix} ${label}`;
}

function formatElementalDamageBonuses(
  gear: Pick<
    GearDto,
    | 'fireDamageBonus'
    | 'fireResistPenetrationBonus'
    | 'coldDamageBonus'
    | 'lightningDamageBonus'
    | 'chaosDamageBonus'
    | 'allElementalDamageBonus'
    | 'fireDamageFlat'
    | 'coldDamageFlat'
    | 'lightningDamageFlat'
    | 'chaosDamageFlat'
  >,
): string[] {
  const parts: string[] = [];
  if (gear.fireDamageBonus !== 0) parts.push(formatSigned(gear.fireDamageBonus, '%', 'Dano Fogo'));
  if (gear.fireResistPenetrationBonus !== 0) {
    parts.push(formatSigned(gear.fireResistPenetrationBonus, '%', 'Ignora Res. Fogo'));
  }
  if (gear.coldDamageBonus !== 0) parts.push(formatSigned(gear.coldDamageBonus, '%', 'Dano Gelo'));
  if (gear.lightningDamageBonus !== 0) {
    parts.push(formatSigned(gear.lightningDamageBonus, '%', 'Dano Raio'));
  }
  if (gear.chaosDamageBonus !== 0) parts.push(formatSigned(gear.chaosDamageBonus, '%', 'Dano Caos'));
  if (gear.allElementalDamageBonus !== 0) {
    parts.push(formatSigned(gear.allElementalDamageBonus, '%', 'Dano Elemental'));
  }
  if (gear.fireDamageFlat !== 0) parts.push(formatSigned(gear.fireDamageFlat, '', 'Dano Fogo'));
  if (gear.coldDamageFlat !== 0) parts.push(formatSigned(gear.coldDamageFlat, '', 'Dano Gelo'));
  if (gear.lightningDamageFlat !== 0) parts.push(formatSigned(gear.lightningDamageFlat, '', 'Dano Raio'));
  if (gear.chaosDamageFlat !== 0) parts.push(formatSigned(gear.chaosDamageFlat, '', 'Dano Caos'));
  return parts;
}

function formatResistBonuses(
  gear: Pick<
    GearDto,
    | 'fireResistBonus'
    | 'coldResistBonus'
    | 'lightningResistBonus'
    | 'chaosResistBonus'
    | 'allElementalResistBonus'
    | 'fireResistFlat'
    | 'coldResistFlat'
    | 'lightningResistFlat'
    | 'chaosResistFlat'
  >,
): string[] {
  const parts: string[] = [];
  if (gear.fireResistBonus !== 0) parts.push(formatSigned(gear.fireResistBonus, '%', 'Res. Fogo'));
  if (gear.coldResistBonus !== 0) parts.push(formatSigned(gear.coldResistBonus, '%', 'Res. Gelo'));
  if (gear.lightningResistBonus !== 0) {
    parts.push(formatSigned(gear.lightningResistBonus, '%', 'Res. Raio'));
  }
  if (gear.chaosResistBonus !== 0) parts.push(formatSigned(gear.chaosResistBonus, '%', 'Res. Caos'));
  if (gear.allElementalResistBonus !== 0) {
    parts.push(formatSigned(gear.allElementalResistBonus, '%', 'Res. Elemental'));
  }
  if (gear.fireResistFlat !== 0) parts.push(formatSigned(gear.fireResistFlat, '', 'Res. Fogo'));
  if (gear.coldResistFlat !== 0) parts.push(formatSigned(gear.coldResistFlat, '', 'Res. Gelo'));
  if (gear.lightningResistFlat !== 0) {
    parts.push(formatSigned(gear.lightningResistFlat, '', 'Res. Raio'));
  }
  if (gear.chaosResistFlat !== 0) parts.push(formatSigned(gear.chaosResistFlat, '', 'Res. Caos'));
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

export function listGearBonusLines(
  gear: Partial<GearDto> & Pick<GearDto, 'attackBonus' | 'defenseBonus' | 'healthBonus'>,
): string[] {
  const stats = {
    attackPercentBonus: gear.attackPercentBonus ?? 0,
    defensePercentBonus: gear.defensePercentBonus ?? 0,
    healthPercentBonus: gear.healthPercentBonus ?? 0,
    physicalDamagePercentBonus: gear.physicalDamagePercentBonus ?? 0,
    attackSpeedBonus: gear.attackSpeedBonus ?? 0,
    castSpeedBonus: gear.castSpeedBonus ?? 0,
    cooldownReductionBonus: gear.cooldownReductionBonus ?? 0,
    critChanceBonus: gear.critChanceBonus ?? 0,
    critDamageBonus: gear.critDamageBonus ?? 0,
    fireResistBonus: gear.fireResistBonus ?? 0,
    coldResistBonus: gear.coldResistBonus ?? 0,
    lightningResistBonus: gear.lightningResistBonus ?? 0,
    chaosResistBonus: gear.chaosResistBonus ?? 0,
    allElementalResistBonus: gear.allElementalResistBonus ?? 0,
    fireResistFlat: gear.fireResistFlat ?? 0,
    coldResistFlat: gear.coldResistFlat ?? 0,
    lightningResistFlat: gear.lightningResistFlat ?? 0,
    chaosResistFlat: gear.chaosResistFlat ?? 0,
    fireDamageBonus: gear.fireDamageBonus ?? 0,
    fireResistPenetrationBonus: gear.fireResistPenetrationBonus ?? 0,
    coldDamageBonus: gear.coldDamageBonus ?? 0,
    lightningDamageBonus: gear.lightningDamageBonus ?? 0,
    chaosDamageBonus: gear.chaosDamageBonus ?? 0,
    allElementalDamageBonus: gear.allElementalDamageBonus ?? 0,
    fireDamageFlat: gear.fireDamageFlat ?? 0,
    coldDamageFlat: gear.coldDamageFlat ?? 0,
    lightningDamageFlat: gear.lightningDamageFlat ?? 0,
    chaosDamageFlat: gear.chaosDamageFlat ?? 0,
    dodgeChanceBonus: gear.dodgeChanceBonus ?? 0,
    blockChanceBonus: gear.blockChanceBonus ?? 0,
    damageReductionBonus: gear.damageReductionBonus ?? 0,
  };

  const parts: string[] = [];

  if (gear.attackBonus !== 0) parts.push(`+${gear.attackBonus} ATK`);
  if (gear.defenseBonus !== 0) parts.push(`+${gear.defenseBonus} DEF`);
  if (gear.healthBonus !== 0) parts.push(`+${gear.healthBonus} HP`);

  if (stats.attackPercentBonus !== 0) {
    parts.push(formatSigned(stats.attackPercentBonus, '%', 'ATK'));
  }
  if (stats.defensePercentBonus !== 0) {
    parts.push(formatSigned(stats.defensePercentBonus, '%', 'DEF'));
  }
  if (stats.healthPercentBonus !== 0) parts.push(formatSigned(stats.healthPercentBonus, '%', 'HP'));
  if (stats.physicalDamagePercentBonus !== 0) {
    parts.push(formatSigned(stats.physicalDamagePercentBonus, '%', 'Dano Físico'));
  }
  if (stats.attackSpeedBonus !== 0) parts.push(formatSigned(stats.attackSpeedBonus, '', 'ASPD'));
  if (stats.castSpeedBonus !== 0) parts.push(formatSigned(stats.castSpeedBonus, '', 'Cast'));
  if (stats.cooldownReductionBonus !== 0) {
    parts.push(formatSigned(stats.cooldownReductionBonus, '%', 'Red. CD'));
  }
  if (stats.critChanceBonus > 0) parts.push(`+${formatPercent(stats.critChanceBonus)} Crít`);
  if (stats.critDamageBonus > 0) parts.push(`+${formatPercent(stats.critDamageBonus)} Crít Dmg`);
  if (stats.dodgeChanceBonus > 0) parts.push(`+${formatPercent(stats.dodgeChanceBonus)} Esquiva`);
  if (stats.blockChanceBonus > 0) parts.push(`+${formatPercent(stats.blockChanceBonus)} Bloqueio`);
  if (stats.damageReductionBonus > 0) {
    parts.push(`+${formatPercent(stats.damageReductionBonus)} Red. Dano`);
  }
  parts.push(...formatResistBonuses(stats));
  parts.push(...formatElementalDamageBonuses(stats));

  return parts;
}

export function renderUniqueEffectLine(gear: Pick<GearDto, 'uniqueEffectDescription'>): string {
  if (!gear.uniqueEffectDescription) return '';
  return `<span class="gear-unique-effect">✦ Efeito único: ${escapeHtml(gear.uniqueEffectDescription)}</span>`;
}

export function formatGearBonuses(
  gear: Partial<GearDto> & Pick<GearDto, 'attackBonus' | 'defenseBonus' | 'healthBonus'>,
): string {
  return listGearBonusLines(gear).join(' · ');
}

export function renderGearBonusLines(
  gear: Partial<GearDto> & Pick<GearDto, 'attackBonus' | 'defenseBonus' | 'healthBonus'>,
): string {
  const lines = listGearBonusLines(gear);
  if (lines.length === 0) {
    return '<span class="gear-stat-lines"><span class="gear-stat-line gear-stat-line--empty">Sem bônus</span></span>';
  }

  const rendered = lines
    .map((line) => `<span class="gear-stat-line">${escapeHtml(line)}</span>`)
    .join('');

  return `<span class="gear-stat-lines">${rendered}</span>`;
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
        <span class="equipment-slot-tooltip-stats">${renderGearBonusLines(gear)}</span>
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
    dragDrop?: boolean;
    activeSlot?: GearSlotKey;
    equipPickerMode?: boolean;
  },
): string {
  const label = GEAR_SLOT_LABELS[slot];
  const variant = options.variant ?? 'default';
  const clickableClass = options.clickable === false ? '' : ' equipment-slot-clickable';
  const dragDrop = options.dragDrop !== false;
  const dropClass = dragDrop ? ' gear-drop-target' : '';
  const dropAttrs = dragDrop ? gearDropTargetAttr(options.heroId, slot) : '';
  const dragAttrs =
    dragDrop && gear
      ? gearDragAttr({
          kind: 'equipped',
          gearId: gear.id,
          heroId: options.heroId,
          slot,
        } satisfies GearDragSource)
      : '';
  const frameUrl = gear ? getGearFrameSprite(gear.rarity) : getGearFrameSprite('common');
  const iconClass =
    variant === 'loadout' ? 'loadout-slot-icon equipment-slot-icon' : 'equipment-slot-icon';
  const icon = gear
    ? imgTag(getGearSprite(gear), gear.name, iconClass)
    : imgTag(getGearSlotSprite(slot), label, `${iconClass} equipment-slot-empty`);

  const rarityClass =
    variant === 'loadout' ? 'loadout-slot-rarity equipment-slot-rarity' : 'equipment-slot-rarity';
  const rarityIcon = gear ? imgTag(getGearRaritySprite(gear.rarity), gear.rarity, rarityClass) : '';
  const isActiveSlot = options.equipPickerMode && options.activeSlot === slot;
  const activeClass = isActiveSlot ? ' loadout-slot--active' : '';
  const ariaLabel = gear
    ? isActiveSlot
      ? `Desequipar ${gear.name}`
      : `${gear.name} · ${label}`
    : `${label}: vazio — clique para equipar`;

  let slotAttrs = `data-hero="${options.heroId}" data-slot="${slot}"`;
  if (options.equipPickerMode) {
    if (isActiveSlot && gear) {
      slotAttrs = `data-unequip-hero="${options.heroId}" data-unequip-slot="${slot}"`;
    } else if (!isActiveSlot) {
      slotAttrs = `data-hero="${options.heroId}" data-slot="${slot}"`;
    }
  }

  if (variant === 'loadout') {
    return `
      <button
        type="button"
        class="loadout-slot loadout-slot--gear equipment-slot equipment-slot--icon-only${clickableClass}${activeClass}${dropClass} ${gear?.rarity ?? 'empty'}"
        ${slotAttrs}
        ${dropAttrs}
        ${dragAttrs}
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
      class="equipment-slot equipment-slot--icon-only${clickableClass}${dropClass} ${gear?.rarity ?? 'empty'}"
      ${slotAttrs}
      ${dropAttrs}
      ${dragAttrs}
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

export function renderHeroEquipmentLoadout(
  hero: HeroDto,
  options: {
    activeSlot?: GearSlotKey;
    equipPickerMode?: boolean;
  } = {},
): string {
  return GEAR_SLOTS.map((slot) =>
    renderEquipmentSlot(slot, getHeroEquipment(hero, slot), {
      heroId: hero.id,
      variant: 'loadout',
      activeSlot: options.activeSlot,
      equipPickerMode: options.equipPickerMode,
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
          ${imgTag(getGearSprite(gear), gear.slot, 'gear-slot-icon')}
          ${imgTag(getGearRaritySprite(gear.rarity), gear.rarity, 'gear-rarity-icon')}
        </div>
        <div class="gear-item-info">
          <div class="gear-item-title-row">
            <strong>${gear.name}</strong>
            ${options.upgradeBadge ?? ''}
          </div>
          <span class="gear-slot-tag">${GEAR_SLOT_LABELS[gear.slot as GearSlotKey] ?? gear.slot}</span>
          <span>${formatGearBonuses(gear)}</span>
          ${renderUniqueEffectLine(gear)}
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
      templateId: gear.templateId,
      slot: gear.slot,
      rarity: gear.rarity,
      attackBonus: gear.attackBonus,
      defenseBonus: gear.defenseBonus,
      healthBonus: gear.healthBonus,
      attackSpeedBonus: gear.attackSpeedBonus ?? 0,
      castSpeedBonus: gear.castSpeedBonus ?? 0,
      critChanceBonus: gear.critChanceBonus ?? 0,
      critDamageBonus: gear.critDamageBonus ?? 0,
      fireResistBonus: gear.fireResistBonus ?? 0,
      coldResistBonus: gear.coldResistBonus ?? 0,
      lightningResistBonus: gear.lightningResistBonus ?? 0,
      chaosResistBonus: gear.chaosResistBonus ?? 0,
      allElementalResistBonus: gear.allElementalResistBonus ?? 0,
      fireDamageBonus: gear.fireDamageBonus ?? 0,
      fireResistPenetrationBonus: gear.fireResistPenetrationBonus ?? 0,
      coldDamageBonus: gear.coldDamageBonus ?? 0,
      lightningDamageBonus: gear.lightningDamageBonus ?? 0,
      chaosDamageBonus: gear.chaosDamageBonus ?? 0,
      allElementalDamageBonus: gear.allElementalDamageBonus ?? 0,
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
