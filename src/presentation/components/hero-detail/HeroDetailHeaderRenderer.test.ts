import { describe, expect, it } from 'vitest';
import { HeroDto } from '../../../application/dto/GameStateDto';
import { renderHeroDetailHeader } from './HeroDetailHeaderRenderer';

function minimalHero(overrides: Partial<HeroDto> = {}): HeroDto {
  return {
    id: 'h1',
    name: 'Elara',
    heroClass: 'priest',
    level: 2,
    attack: 10,
    defense: 6,
    health: 70,
    maxHealth: 80,
    ascensionId: null,
    experience: 0,
    experienceToNextLevel: 100,
    ...overrides,
  } as HeroDto;
}

describe('renderHeroDetailHeader', () => {
  it('mostra level, classe e tier no topo do modal', () => {
    const html = renderHeroDetailHeader(minimalHero());

    expect(html).toContain('hero-level-class-line');
    expect(html).toContain('Lv.2 Priest - Aprendiz');
    expect(html).not.toMatch(/<span class="hero-level">Lv\.2<\/span>/);
  });

  it('mostra evolução atual quando herói já ascendeu', () => {
    const html = renderHeroDetailHeader(
      minimalHero({
        heroClass: 'knight',
        level: 8,
        ascensionId: 'knight_military_guerreiro',
      }),
    );

    expect(html).toContain('Lv.8 Knight - Guerreiro');
  });
});
