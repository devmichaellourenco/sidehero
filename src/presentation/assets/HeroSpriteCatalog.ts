import { HeroClass } from '../../domain/entities/HeroClass';
import { AscensionId } from '../../domain/progression/SkillId';

export interface HeroSpriteInput {
  id: string;
  heroClass: string;
  ascensionId?: string | null;
}

const HERO_BASE_SPRITES: Record<string, string> = {
  'hero-1': 'characters/galneon_aprendiz.png',
  'hero-2': 'characters/nix_aprendiz.png',
  'hero-3': 'characters/priest_aprendiz.png',
  'hero-berserker': 'characters/berserker.png',
  'hero-paladin': 'characters/paladin.png',
};

const HERO_ASCENSION_SPRITES: Record<string, Partial<Record<AscensionId, string>>> = {
  'hero-1': {
    knight_guardian: 'characters/galneon_general.png',
    knight_reaver: 'characters/galneon_guerreiro.png',
  },
  'hero-2': {
    sorcerer_pyromancer: 'characters/nix_feiticeira.png',
    sorcerer_arcanist: 'characters/nix_feiticeira.png',
  },
  'hero-3': {
    priest_oracle: 'characters/priest.png',
    priest_inquisitor: 'characters/priest.png',
  },
};

const CLASS_FALLBACK_SPRITES: Record<HeroClass, string> = {
  knight: 'characters/galneon_aprendiz.png',
  sorcerer: 'characters/nix_aprendiz.png',
  priest: 'characters/priest_aprendiz.png',
  berserker: 'characters/berserker.png',
  paladin: 'characters/paladin.png',
};

export function resolveHeroSpritePath(hero: HeroSpriteInput): string {
  if (hero.ascensionId) {
    const ascensionSprite = HERO_ASCENSION_SPRITES[hero.id]?.[hero.ascensionId as AscensionId];
    if (ascensionSprite) return ascensionSprite;
  }

  return HERO_BASE_SPRITES[hero.id] ?? CLASS_FALLBACK_SPRITES[hero.heroClass as HeroClass] ?? CLASS_FALLBACK_SPRITES.knight;
}
