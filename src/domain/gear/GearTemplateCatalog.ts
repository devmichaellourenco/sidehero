import { ActiveGearSlot } from './GearSlotCatalog';
import {
  GALNEON_HERO_ID,
  GALNEON_STANDARD_SWORD_BASE_NAME,
  GALNEON_STANDARD_SWORD_SPRITES,
  GALNEON_STANDARD_SWORD_TEMPLATE_ID,
} from './GalneonGearCatalog';

export interface GearTemplateDefinition {
  id: string;
  baseName: string;
  slot: ActiveGearSlot;
  /** Caminho relativo em `panel/assets/`. */
  sprite: string;
  /** Sprite alternativo por raridade (ex.: espada padrão do Galneon). */
  spriteByRarity?: Partial<Record<GearRarity, string>>;
  /** Quando definido, só o herói com este id pode equipar. */
  exclusiveHeroId?: string;
}

export const GEAR_TEMPLATES: GearTemplateDefinition[] = [
  {
    id: 'rusty_blade',
    baseName: 'Espada Enferrujada',
    slot: 'weapon',
    sprite: 'gear/items/equip_axe_0.png',
  },
  {
    id: 'pixel_axe',
    baseName: 'Machado Pixel',
    slot: 'weapon',
    sprite: 'gear/items/equip_axe_2.png',
  },
  {
    id: 'arcane_staff',
    baseName: 'Cajado Arcano',
    slot: 'weapon',
    sprite: 'gear/items/equip_hammer_1.png',
  },
  {
    id: 'side_blade',
    baseName: 'Lâmina Side',
    slot: 'weapon',
    sprite: 'gear/items/equip_axe_4.png',
  },
  {
    id: 'wood_shield',
    baseName: 'Escudo de Madeira',
    slot: 'armor',
    sprite: 'gear/items/equip_shield_wood.png',
  },
  {
    id: 'armor_8bit',
    baseName: 'Armadura 8-bit',
    slot: 'armor',
    sprite: 'gear/items/equip_shield_blue.png',
  },
  {
    id: 'hero_mantle',
    baseName: 'Manto do Herói',
    slot: 'armor',
    sprite: 'gear/items/equip_leaf.png',
  },
  {
    id: 'chrome_plate',
    baseName: 'Placa Chrome',
    slot: 'armor',
    sprite: 'gear/items/equip_hard_tooth.png',
  },
  {
    id: 'copper_ring',
    baseName: 'Anel de Cobre',
    slot: 'accessory',
    sprite: 'gear/items/equip_ring_blue.png',
  },
  {
    id: 'idle_amulet',
    baseName: 'Amuleto Idle',
    slot: 'accessory',
    sprite: 'gear/items/equip_bracelet.png',
  },
  {
    id: 'rpg_pendant',
    baseName: 'Pingente RPG',
    slot: 'accessory',
    sprite: 'gear/items/equip_dragon_tooth.png',
  },
  {
    id: 'extension_badge',
    baseName: 'Badge Extensão',
    slot: 'accessory',
    sprite: 'gear/items/equip_gem_red.png',
  },
  {
    id: GALNEON_STANDARD_SWORD_TEMPLATE_ID,
    baseName: GALNEON_STANDARD_SWORD_BASE_NAME,
    slot: 'weapon',
    sprite: GALNEON_STANDARD_SWORD_SPRITES.common,
    spriteByRarity: GALNEON_STANDARD_SWORD_SPRITES,
    exclusiveHeroId: GALNEON_HERO_ID,
  },
];

const TEMPLATE_BY_ID = new Map(GEAR_TEMPLATES.map((entry) => [entry.id, entry]));

export const DEFAULT_GEAR_TEMPLATE_BY_SLOT: Record<ActiveGearSlot, string> = {
  weapon: 'rusty_blade',
  armor: 'wood_shield',
  accessory: 'copper_ring',
};

export function getGearTemplate(templateId: string): GearTemplateDefinition | undefined {
  return TEMPLATE_BY_ID.get(templateId);
}

export function listGearTemplatesForSlot(slot: ActiveGearSlot): GearTemplateDefinition[] {
  return GEAR_TEMPLATES.filter((entry) => entry.slot === slot && !entry.exclusiveHeroId);
}

export function resolveGearTemplateSprite(
  template: GearTemplateDefinition,
  rarity?: GearRarity,
): string {
  if (rarity && template.spriteByRarity?.[rarity]) {
    return template.spriteByRarity[rarity]!;
  }
  return template.sprite;
}

export function stripGearRaritySuffix(name: string): string {
  return name.replace(/\s*\([^)]+\)\s*$/, '').trim();
}

export function resolveGearTemplateId(name: string, slot: ActiveGearSlot): string {
  const baseName = stripGearRaritySuffix(name);
  const match = GEAR_TEMPLATES.find((entry) => entry.slot === slot && entry.baseName === baseName);
  return match?.id ?? DEFAULT_GEAR_TEMPLATE_BY_SLOT[slot];
}
