import { describe, expect, it } from 'vitest';
import { formatCombatResistTooltipLine } from '../../application/mappers/CombatResistMapper';
import { renderEnemyTooltipContent } from './EnemyBattlePresentation';
import { renderHeroTooltipContent } from './HeroBattlePresentation';

function minimalHero() {
  return {
    name: 'Aria',
    level: 5,
    health: 80,
    maxHealth: 100,
    attack: 20,
    defense: 8,
    attackSpeed: 1.2,
    castSpeed: 1.1,
    critChance: 0.1,
    critDamage: 1.5,
    experience: 40,
    experienceToNextLevel: 100,
    combatResists: { fire: 12, cold: 0, lightning: 0, chaos: 5 },
  } as Parameters<typeof renderHeroTooltipContent>[0];
}

function minimalEnemy() {
  return {
    name: 'Goblin',
    health: 40,
    maxHealth: 40,
    attack: 10,
    defense: 4,
    goldReward: 5,
    xpReward: 0,
    signatureSkills: [],
    combatResists: { fire: 0, cold: 15, lightning: 0, chaos: 0 },
  } as Parameters<typeof renderEnemyTooltipContent>[0];
}

describe('battle tooltip resists', () => {
  it('mostra linha de resistências do herói quando > 0', () => {
    const html = renderHeroTooltipContent(minimalHero());

    expect(html).toContain('Resist: Fogo 12% · Caos 5%');
    expect(html).toContain('hero-tooltip-resist');
  });

  it('mostra linha de resistências do inimigo quando > 0', () => {
    const html = renderEnemyTooltipContent(minimalEnemy(), 20);

    expect(html).toContain('Resist: Gelo 15%');
    expect(html).toContain('enemy-tooltip-resist');
  });

  it('omite linha quando não há resistências', () => {
    const line = formatCombatResistTooltipLine({
      fire: 0,
      cold: 0,
      lightning: 0,
      chaos: 0,
    });

    expect(line).toBeNull();
  });
});
