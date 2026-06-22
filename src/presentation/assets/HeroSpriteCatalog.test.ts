import { describe, expect, it } from 'vitest';
import { resolveHeroSpritePath } from './HeroSpriteCatalog';

describe('HeroSpriteCatalog', () => {
  it('usa sprite aprendiz sem ascensão', () => {
    expect(
      resolveHeroSpritePath({ id: 'hero-1', heroClass: 'knight', ascensionId: null }),
    ).toBe('characters/galneon_aprendiz.png');
  });

  it('usa sprite de ascensão do Galneon', () => {
    expect(
      resolveHeroSpritePath({ id: 'hero-1', heroClass: 'knight', ascensionId: 'knight_guardian' }),
    ).toBe('characters/galneon_general.png');

    expect(
      resolveHeroSpritePath({ id: 'hero-1', heroClass: 'knight', ascensionId: 'knight_reaver' }),
    ).toBe('characters/galneon_guerreiro.png');
  });

  it('usa sprite de ascensão da Nix', () => {
    expect(
      resolveHeroSpritePath({
        id: 'hero-2',
        heroClass: 'sorcerer',
        ascensionId: 'sorcerer_pyromancer',
      }),
    ).toBe('characters/nix_feiticeira.png');
  });

  it('cai no fallback por classe para herói desconhecido', () => {
    expect(
      resolveHeroSpritePath({ id: 'custom', heroClass: 'paladin', ascensionId: null }),
    ).toBe('characters/paladin.png');
  });
});
