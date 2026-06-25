import { ActiveGearSlot } from '../../domain/gear/GearSlotCatalog';
import {
  DEFAULT_GEAR_TEMPLATE_BY_SLOT,
  getGearTemplate,
} from '../../domain/gear/GearTemplateCatalog';

export interface GearSpriteInput {
  templateId?: string;
  slot: string;
}

const SLOT_FALLBACK_SPRITES: Record<ActiveGearSlot, string> = {
  weapon: 'gear/weapon.png',
  armor: 'gear/armor.png',
  accessory: 'gear/accessory.png',
};

export function resolveGearSpritePath(gear: GearSpriteInput): string {
  const templateId = gear.templateId ?? DEFAULT_GEAR_TEMPLATE_BY_SLOT[gear.slot as ActiveGearSlot];
  const template = templateId ? getGearTemplate(templateId) : undefined;
  if (template) {
    return template.sprite;
  }

  return SLOT_FALLBACK_SPRITES[gear.slot as ActiveGearSlot] ?? SLOT_FALLBACK_SPRITES.weapon;
}
