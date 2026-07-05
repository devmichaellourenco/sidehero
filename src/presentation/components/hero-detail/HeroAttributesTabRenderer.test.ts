import { describe, expect, it } from 'vitest';
import { HeroDto } from '../../application/dto/GameStateDto';
import { renderHeroAttributesTab } from './HeroAttributesTabRenderer';

function minimalHero(overrides: Partial<HeroDto> = {}): HeroDto {
  return {
    id: 'h1',
    name: 'Nix',
    heroClass: 'sorcerer',
    emoji: '🔮',
    level: 3,
    experience: 0,
    experienceToNextLevel: 100,
    attack: 24,
    defense: 8,
    attackSpeed: 0.4,
    castSpeed: 1,
    critChance: 0.05,
    critDamage: 1.65,
    health: 80,
    maxHealth: 90,
    baseAttributes: { str: 5, dex: 8, int: 14 },
    allocatedAttributes: { str: 1, dex: 0, int: 2 },
    totalAttributes: { str: 6, dex: 8, int: 16 },
    unspentImprovementPoints: 1,
    unspentAscensionPoints: 0,
    skillRanks: { basic_attack: 1 },
    equippedSkillIds: ['basic_attack'],
    activeSkills: [null, null, null],
    maxActiveSkills: 3,
    unlockedActiveSkillSlots: 1,
    ascensionId: null,
    hasUnspentPoints: true,
    equipment: { weapon: null, armor: null, accessory: null },
    combatIntent: null,
    combatSkills: [],
    combatSkillCooldowns: [],
    statusEffects: [],
    combatResists: { fire: 0, cold: 0, lightning: 0, chaos: 0 },
    combatStatSheet: [
      {
        id: 'offense',
        title: 'Ofensiva',
        lines: [
          {
            id: 'dps',
            label: 'DPS estimado',
            value: '12.4',
            tooltipLines: ['Estimativa com ataque básico contínuo.'],
          },
        ],
      },
    ],
    ...overrides,
  } as HeroDto;
}

describe('renderHeroAttributesTab', () => {
  it('renderiza atributos em linha e ficha de combate com tooltip', () => {
    const html = renderHeroAttributesTab(minimalHero());

    expect(html).toContain('hero-attr-row');
    expect(html).toContain('data-attr-spend="str"');
    expect(html).toContain('hero-attr-add');
    expect(html).not.toContain('+1 STR');
    expect(html).toContain('hero-stat-row');
    expect(html).toContain('data-hero-stat-tooltip');
    expect(html).toContain('DPS estimado');
    expect(html).toContain('hero-stat-tooltip-content');
  });
});
