export type HeroClass = 'knight' | 'sorcerer' | 'priest' | 'berserker' | 'archer' | 'paladin';

export const HERO_CLASSES: readonly HeroClass[] = [
  'knight',
  'sorcerer',
  'priest',
  'berserker',
  'archer',
  'paladin',
];

export const STARTER_HERO_CLASSES: readonly HeroClass[] = ['knight', 'sorcerer', 'priest'];

export const UNLOCKABLE_HERO_CLASSES: readonly HeroClass[] = ['berserker', 'archer', 'paladin'];
