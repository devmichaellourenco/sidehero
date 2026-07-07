import { describe, expect, it } from 'vitest';
import { HeroDto } from '../../../application/dto/GameStateDto';
import { SkillNodeDto } from '../../../application/dto/SkillNodeDto';
import { renderHeroSkillsTab } from './HeroSkillsTabRenderer';

function minimalHero(): HeroDto {
  return {
    id: 'h1',
    name: 'Galneon',
    heroClass: 'knight',
    activeSkills: [{ id: 'thrust' } as HeroDto['activeSkills'][number], null],
    unlockedActiveSkillSlots: 2,
  } as HeroDto;
}

function skillNode(overrides: Partial<SkillNodeDto> = {}): SkillNodeDto {
  return {
    id: 'thrust',
    name: 'Investida',
    description: 'Golpe pesado.',
    branch: 'offense',
    branchLabel: 'Ofensivo',
    scope: 'class',
    scopeLabel: 'Classe',
    maxRank: 3,
    currentRank: 1,
    status: 'owned',
    isEquipped: false,
    canAllocateRank: false,
    canEquip: true,
    scaling: 'str',
    scalingLabel: 'STR',
    battleStats: [],
    requirements: [],
    ...overrides,
  };
}

describe('renderHeroSkillsTab', () => {
  it('não renderiza hints estáticos de equipar ou hover', () => {
    const html = renderHeroSkillsTab(minimalHero(), [skillNode()]);

    expect(html).toContain('hero-skills-tab-scroll');
    expect(html).toContain('Investida');
    expect(html).not.toContain('hero-skills-tab-meta');
    expect(html).not.toContain('Skills equipadas');
    expect(html).not.toContain('Passe o mouse sobre');
    expect(html).not.toContain('Toque em uma skill para equipar');
    expect(html).not.toContain('arraste até um slot');
    expect(html).not.toContain('Toque para equipar');
    expect(html).not.toContain('skill-card-equip-hint');
  });
});
