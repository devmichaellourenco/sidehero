import { GEAR_RARITIES, GearRarity, GearSlot } from '../entities/Gear';
import { GALNEON_STANDARD_SWORD_TEMPLATE_ID } from '../gear/GalneonGearCatalog';
import { listGearTemplatesForSlot } from '../gear/GearTemplateCatalog';
import { ACTIVE_GEAR_SLOTS } from '../gear/GearSlotCatalog';

export const SHOP_OFFER_COUNT = 8;

/** Slots por posição — garante variedade (3 armas, 3 armaduras, 2 acessórios). */
export const SHOP_SLOT_BY_INDEX: GearSlot[] = [
  'weapon',
  'armor',
  'accessory',
  'weapon',
  'armor',
  'accessory',
  'weapon',
  'armor',
];

const RARITY_WEIGHT_BASE: Record<GearRarity, number> = {
  common: 42,
  uncommon: 28,
  rare: 16,
  epic: 9,
  legendary: 4,
  mythic: 1,
};

export function shopDeterministicRoll(tier: number, refreshSeed: number, offerIndex: number): number {
  return Math.abs((tier * 997 + refreshSeed * 991 + offerIndex * 983 + 17) | 0);
}

export function getShopMaxRarityIndex(tier: number): number {
  if (tier <= 3) return 1;
  if (tier <= 10) return 2;
  if (tier <= 25) return 3;
  if (tier <= 60) return 4;
  return 5;
}

export function rollShopRarity(tier: number, refreshSeed: number, offerIndex: number): GearRarity {
  const maxIndex = getShopMaxRarityIndex(tier);
  const allowed = GEAR_RARITIES.slice(0, maxIndex + 1);

  const weights = allowed.map((rarity, index) => {
    let weight = RARITY_WEIGHT_BASE[rarity];
    weight += Math.floor(tier / 15) * index;
    return weight;
  });

  const total = weights.reduce((sum, value) => sum + value, 0);
  let roll = shopDeterministicRoll(tier, refreshSeed, offerIndex) % total;

  for (let i = 0; i < allowed.length; i += 1) {
    roll -= weights[i];
    if (roll < 0) {
      return allowed[i];
    }
  }

  return allowed[allowed.length - 1];
}

export function buildShopOfferId(tier: number, refreshSeed: number, offerIndex: number): string {
  return `shop-${tier}-${refreshSeed}-o${offerIndex}`;
}

export function parseShopOfferIndex(offerId: string): number | null {
  const match = offerId.match(/^shop-\d+-\d+-o(\d+)$/);
  if (!match) return null;
  return Number(match[1]);
}

/** Garante que nenhum par slot+template se repita no mesmo estoque. */
export function pickUniqueShopTemplateId(
  slot: GearSlot,
  tier: number,
  refreshSeed: number,
  offerIndex: number,
  usedTemplateKeys: Set<string>,
): string {
  const templates = listGearTemplatesForSlot(slot);
  const galneonKey = `${slot}:${GALNEON_STANDARD_SWORD_TEMPLATE_ID}`;

  if (
    slot === 'weapon' &&
    tier >= 3 &&
    offerIndex % 4 === 0 &&
    !usedTemplateKeys.has(galneonKey)
  ) {
    return GALNEON_STANDARD_SWORD_TEMPLATE_ID;
  }

  const start = shopDeterministicRoll(tier, refreshSeed, offerIndex) % Math.max(1, templates.length);

  for (let offset = 0; offset < templates.length; offset += 1) {
    const template = templates[(start + offset) % templates.length];
    const key = `${slot}:${template.id}`;
    if (!usedTemplateKeys.has(key)) {
      return template.id;
    }
  }

  return templates[start % templates.length].id;
}

export function listShopSlots(): GearSlot[] {
  return [...ACTIVE_GEAR_SLOTS];
}

export function getShopMaxRarityForTier(tier: number): GearRarity {
  return GEAR_RARITIES[getShopMaxRarityIndex(tier)];
}
