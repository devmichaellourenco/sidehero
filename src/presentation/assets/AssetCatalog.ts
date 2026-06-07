export type HeroClassKey = 'knight' | 'sorcerer' | 'priest';
export type GearSlotKey = 'weapon' | 'armor' | 'accessory';
export type GearRarityKey = 'common' | 'rare' | 'epic';

const HERO_SPRITES: Record<HeroClassKey, string> = {
  knight: 'characters/knight.png',
  sorcerer: 'characters/sorcerer.png',
  priest: 'characters/priest.png',
};

const GEAR_SLOT_SPRITES: Record<GearSlotKey, string> = {
  weapon: 'gear/weapon.png',
  armor: 'gear/armor.png',
  accessory: 'gear/accessory.png',
};

const GEAR_RARITY_SPRITES: Record<GearRarityKey, string> = {
  common: 'gear/common.png',
  rare: 'gear/rare.png',
  epic: 'gear/epic.png',
};

const GEAR_FRAME_SPRITES: Record<GearRarityKey, string> = {
  common: 'frames/item-common.png',
  rare: 'frames/item-rare.png',
  epic: 'frames/item-epic.png',
};

export const ASSETS = {
  fonts: {
    body: 'fonts/Alata-Regular.ttf',
    heading: 'fonts/JosefinSans-Bold.ttf',
  },
  characters: {
    enemy: 'characters/enemy.png',
    glow: 'characters/glow.png',
  },
  ui: {
    brand: 'ui/brand.png',
    gold: 'ui/gold.png',
    chest: 'ui/chest.png',
    energy: 'ui/energy.png',
    stage: 'ui/stage.png',
    attack: 'ui/attack.png',
    defense: 'ui/defense.png',
    health: 'ui/health.png',
    inventory: 'ui/inventory.png',
  },
  backgrounds: {
    battle: 'backgrounds/battle.png',
    app: 'backgrounds/app.png',
  },
  frames: {
    card: 'frames/card.png',
  },
  buttons: {
    primary: 'buttons/primary.png',
    secondary: 'buttons/secondary.png',
  },
  sliders: {
    frame: 'sliders/frame.png',
    fillHero: 'sliders/fill-hero.png',
    fillEnemy: 'sliders/fill-enemy.png',
  },
} as const;

export function getAssetUrl(relativePath: string): string {
  return chrome.runtime.getURL(`panel/assets/${relativePath}`);
}

export function getHeroSprite(heroClass: string): string {
  return getAssetUrl(HERO_SPRITES[heroClass as HeroClassKey] ?? HERO_SPRITES.knight);
}

export function getGearSlotSprite(slot: string): string {
  return getAssetUrl(GEAR_SLOT_SPRITES[slot as GearSlotKey] ?? GEAR_SLOT_SPRITES.weapon);
}

export function getGearRaritySprite(rarity: string): string {
  return getAssetUrl(GEAR_RARITY_SPRITES[rarity as GearRarityKey] ?? GEAR_RARITY_SPRITES.common);
}

export function getGearFrameSprite(rarity: string): string {
  return getAssetUrl(GEAR_FRAME_SPRITES[rarity as GearRarityKey] ?? GEAR_FRAME_SPRITES.common);
}

export function imgTag(src: string, alt: string, className?: string): string {
  const classAttr = className ? ` class="${className}"` : '';
  return `<img src="${src}" alt="${alt}"${classAttr} loading="lazy" />`;
}
