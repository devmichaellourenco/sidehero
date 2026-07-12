import { ActiveGearSlot } from './GearSlotCatalog';
import { GearItemDefinition } from './GearItemDefinition';
import catalogData from './data/gear-items.catalog.json';
import { UniqueEffectId } from '../unique-effects/UniqueEffectCatalog';

/** Definição visual — um registro por item do catálogo (spriteId único). */
export interface GearTemplateDefinition {
  id: string;
  slot: ActiveGearSlot;
  sprite: string;
  uniqueEffectId?: UniqueEffectId;
}

const UNIQUE_EFFECT_BY_SPRITE_ID: Partial<Record<string, UniqueEffectId>> = {
  sword_vorpal_lupnus: 'vorpal_lupnus_heal_block',
  soler_plegius: 'soler_plegius_cleanse',
};

const CATALOG_ITEMS = catalogData as GearItemDefinition[];

export const GEAR_TEMPLATES: GearTemplateDefinition[] = CATALOG_ITEMS.map((item) => ({
  id: item.spriteId,
  slot: item.slot,
  sprite: item.sprite,
  uniqueEffectId: UNIQUE_EFFECT_BY_SPRITE_ID[item.id],
}));

const TEMPLATE_BY_ID = new Map(GEAR_TEMPLATES.map((entry) => [entry.id, entry]));

export const DEFAULT_GEAR_TEMPLATE_BY_SLOT: Record<ActiveGearSlot, string> = {
  weapon: 'worn_sword',
  armor: 'wooden_shield',
  accessory: 'copper_ring',
};

export function getGearTemplate(spriteId: string): GearTemplateDefinition | undefined {
  return TEMPLATE_BY_ID.get(spriteId);
}

export function resolveGearTemplateSprite(template: GearTemplateDefinition): string {
  return template.sprite;
}

export function resolveGearSpriteId(catalogItemId: string): string {
  return catalogItemId;
}
