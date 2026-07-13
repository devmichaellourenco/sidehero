import { describe, expect, it } from 'vitest';
import { renderBattleActorCard } from './BattleActorCardPresentation';

describe('renderBattleActorCard', () => {
  it('renderiza card de herói com hitbox interativo e barra de vida', () => {
    const html = renderBattleActorCard({
      side: 'hero',
      id: 'h1',
      name: 'Arthos',
      isActiveTurn: true,
      spriteInnerHtml: '<span class="hero-sprite-img"></span>',
      tooltipHtml: '<span>tooltip</span>',
      healthLabel: '80/100',
      healthPercent: 80,
      actionTimeRatio: 1,
      statusEffects: [],
      combatSkills: [],
    });

    expect(html).toContain('hero-battle-card--active-turn');
    expect(html).toContain('data-hero-battle-open="h1"');
    expect(html).toContain('data-action-time-bar');
    expect(html).toContain('strip-actor-bars');
  });

  it('renderiza card de inimigo com classe de boss quando indicado', () => {
    const html = renderBattleActorCard({
      side: 'enemy',
      id: 'e1',
      name: 'Goblin',
      isActiveTurn: false,
      isBoss: true,
      spriteInnerHtml: '<span class="enemy-sprite-img"></span>',
      tooltipHtml: '<span>tooltip</span>',
      healthLabel: '50/50',
      healthPercent: 100,
      actionTimeRatio: 1,
      statusEffects: [],
      combatSkills: [],
    });

    expect(html).toContain('enemy-battle-card--boss');
    expect(html).toContain('data-enemy-id="e1"');
    expect(html).toContain('health-bar enemy strip-bar');
  });
});
