import { GearRarity, GearRequirements } from '../entities/Gear';
import { ActiveGearSlot } from './GearSlotCatalog';
import {
  GALNEON_HERO_ID,
  GALNEON_STANDARD_SWORD_BASE_NAME,
  GALNEON_STANDARD_SWORD_SPRITES,
  GALNEON_STANDARD_SWORD_TEMPLATE_ID,
} from './GalneonGearCatalog';
import { UniqueEffectId } from '../unique-effects/UniqueEffectCatalog';
import { SWORD_VORPAL_LUPNUS_TEMPLATE_ID, IGNUS_IX_TEMPLATE_ID, SOLER_PLEGIUS_TEMPLATE_ID, IGNUS_IX_FIXED_REQUIREMENTS } from './UniqueGearCatalog';

export type GearElementTheme = 'fire' | 'cold' | 'lightning' | 'chaos';

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
  /** Tema elemental — afixa dano/resistência coerente no loot. */
  elementTheme?: GearElementTheme;
  /** Apenas uma cópia pode existir no save (inventário, baú ou equipado). */
  unique?: boolean;
  /** Efeito de combate exclusivo programado no domínio. */
  uniqueEffectId?: UniqueEffectId;
  /** Nome fixo sem sufixo de raridade (lendário nomeado, sem regra de unicidade no save). */
  namedLegendary?: boolean;
  /** Bônus fixos ao gerar do template (substituem rolls procedurais correspondentes). */
  fixedBonuses?: {
    fireDamageBonus?: number;
    fireResistPenetrationBonus?: number;
  };
  /** Requisitos fixos (ex.: lendário recebido cedo mas equipável só no nível 30). */
  fixedRequirements?: GearRequirements;
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
    id: 'flame_brand',
    baseName: 'Espada Ígnea',
    slot: 'weapon',
    sprite: 'gear/items/equip_gem_red.png',
    elementTheme: 'fire',
  },
  {
    id: 'frostbite_blade',
    baseName: 'Lâmina Gelada',
    slot: 'weapon',
    sprite: 'gear/items/equip_ring_blue.png',
    elementTheme: 'cold',
  },
  {
    id: 'storm_rod',
    baseName: 'Vara do Trovão',
    slot: 'weapon',
    sprite: 'gear/items/equip_hammer_1.png',
    elementTheme: 'lightning',
  },
  {
    id: 'venom_fang',
    baseName: 'Presa Venenosa',
    slot: 'weapon',
    sprite: 'gear/items/equip_dragon_tooth.png',
    elementTheme: 'chaos',
  },
  {
    id: 'ember_plate',
    baseName: 'Couraça das Brasa',
    slot: 'armor',
    sprite: 'gear/items/equip_hard_tooth.png',
    elementTheme: 'fire',
  },
  {
    id: 'glacial_mail',
    baseName: 'Malha Glacial',
    slot: 'armor',
    sprite: 'gear/items/equip_shield_blue.png',
    elementTheme: 'cold',
  },
  {
    id: 'stormguard',
    baseName: 'Couraça Trovão',
    slot: 'armor',
    sprite: 'gear/items/equip_leaf.png',
    elementTheme: 'lightning',
  },
  {
    id: 'void_shroud',
    baseName: 'Manto do Caos',
    slot: 'armor',
    sprite: 'gear/items/equip_shield_wood.png',
    elementTheme: 'chaos',
  },
  {
    id: 'ruby_signet',
    baseName: 'Anel Rubi',
    slot: 'accessory',
    sprite: 'gear/items/equip_gem_red.png',
    elementTheme: 'fire',
  },
  {
    id: 'sapphire_charm',
    baseName: 'Amuleto Safira',
    slot: 'accessory',
    sprite: 'gear/items/equip_ring_blue.png',
    elementTheme: 'cold',
  },
  {
    id: 'voltaic_loop',
    baseName: 'Bracelete Voltaico',
    slot: 'accessory',
    sprite: 'gear/items/equip_bracelet.png',
    elementTheme: 'lightning',
  },
  {
    id: 'entropy_pendant',
    baseName: 'Pingente Entropia',
    slot: 'accessory',
    sprite: 'gear/items/equip_dragon_tooth.png',
    elementTheme: 'chaos',
  },
  {
    id: GALNEON_STANDARD_SWORD_TEMPLATE_ID,
    baseName: GALNEON_STANDARD_SWORD_BASE_NAME,
    slot: 'weapon',
    sprite: GALNEON_STANDARD_SWORD_SPRITES.common,
    spriteByRarity: GALNEON_STANDARD_SWORD_SPRITES,
    exclusiveHeroId: GALNEON_HERO_ID,
  },
  {
    id: SWORD_VORPAL_LUPNUS_TEMPLATE_ID,
    baseName: 'Vorpal Lupnus',
    slot: 'weapon',
    sprite: 'gear/items/sword_vorpal_lupnus.png',
    unique: true,
    uniqueEffectId: 'vorpal_lupnus_heal_block',
  },
  {
    id: IGNUS_IX_TEMPLATE_ID,
    baseName: 'Ignus Ix',
    slot: 'accessory',
    sprite: 'gear/items/ignus_ix.png',
    namedLegendary: true,
    fixedBonuses: {
      fireDamageBonus: 30,
      fireResistPenetrationBonus: 30,
    },
    fixedRequirements: IGNUS_IX_FIXED_REQUIREMENTS,
  },
  {
    id: SOLER_PLEGIUS_TEMPLATE_ID,
    baseName: 'Soler Plégius',
    slot: 'weapon',
    sprite: 'gear/items/soler_plegius.png',
    namedLegendary: true,
    uniqueEffectId: 'soler_plegius_cleanse',
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
  return GEAR_TEMPLATES.filter(
    (entry) =>
      entry.slot === slot &&
      !entry.exclusiveHeroId &&
      !entry.unique &&
      !entry.namedLegendary,
  );
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
