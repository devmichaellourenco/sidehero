import { isExtensionContextValid } from '../../infrastructure/messaging/ExtensionContext';
import { getEnemyRosterEntry } from '../../domain/enemies/EnemyRosterCatalog';

export type HeroClassKey = 'knight' | 'sorcerer' | 'priest' | 'berserker' | 'paladin';
export type GearSlotKey = 'weapon' | 'armor' | 'accessory';
export type GearRarityKey = 'common' | 'rare' | 'epic';

const HERO_SPRITES: Record<HeroClassKey, string> = {
  knight: 'characters/knight.png',
  sorcerer: 'characters/sorcerer.png',
  priest: 'characters/priest.png',
  berserker: 'characters/berserker.png',
  paladin: 'characters/paladin.png',
};

const ENEMY_PLACEHOLDER_SPRITES = {
  common: 'characters/goblin.png',
  boss: 'characters/goblin_boss.png',
  saci: 'characters/saci_boss.png',
} as const;

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
    glow: 'characters/glow.png',
  },
  ui: {
    brand: 'ui/brand.png',
    gold: 'ui/gold.png',
    chest: 'ui/chest.png',
    chestOpen: 'ui/chest-open.png',
    victoryFrame: 'ui/victory-frame.png',
    victoryGlow: 'ui/victory-glow.png',
    victoryWings: 'ui/victory-wings.png',
    energy: 'ui/energy.png',
    stage: 'ui/stage.png',
    attack: 'ui/attack.png',
    defense: 'ui/defense.png',
    health: 'ui/health.png',
    inventory: 'ui/inventory.png',
  },
  skills: {
    attack: 'ui/attack.png',
    magic: 'ui/energy.png',
    heal: 'skills/heal.png',
    buff: 'ui/defense.png',
    debuff: 'ui/defense.png',
    physical: 'ui/attack.png',
    weapon: 'gear/weapon.png',
    chest: 'ui/chest.png',
    vitality: 'skills/vitality.png',
    arcane_bolt: 'skills/arcane_bolt.png',
    fireball: 'skills/fireball.png',
    mana_shield: 'skills/mana_shield.png',
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
  if (!isExtensionContextValid()) {
    return '';
  }

  try {
    return chrome.runtime.getURL(`panel/assets/${relativePath}`);
  } catch {
    return '';
  }
}

export function getHeroSprite(heroClass: string): string {
  return getAssetUrl(HERO_SPRITES[heroClass as HeroClassKey] ?? HERO_SPRITES.knight);
}

/** Sprite placeholder: comuns → goblin; subchefes/chefes → goblin_boss; Saci → saci_boss. */
export function getEnemySpriteUrl(enemyType: string, enemyName: string): string {
  const entry = getEnemyRosterEntry(enemyType);

  if (entry?.spriteVariant === 'saci' || enemyType === 'saci') {
    return getAssetUrl(ENEMY_PLACEHOLDER_SPRITES.saci);
  }

  if (
    enemyName.startsWith('Elite ') ||
    enemyName.startsWith('Boss ') ||
    entry?.rosterRole === 'subboss' ||
    entry?.rosterRole === 'boss'
  ) {
    return getAssetUrl(ENEMY_PLACEHOLDER_SPRITES.boss);
  }

  return getAssetUrl(ENEMY_PLACEHOLDER_SPRITES.common);
}

/** @deprecated Use getEnemySpriteUrl */
export function getEnemySprite(enemyType: string, options?: { isBoss?: boolean }): string {
  if (options?.isBoss) {
    const entry = getEnemyRosterEntry(enemyType);
    if (entry?.spriteVariant === 'saci' || enemyType === 'saci') {
      return getAssetUrl(ENEMY_PLACEHOLDER_SPRITES.saci);
    }
    return getAssetUrl(ENEMY_PLACEHOLDER_SPRITES.boss);
  }
  return getEnemySpriteUrl(enemyType, '');
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
