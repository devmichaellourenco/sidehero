import { describe, expect, it } from 'vitest';
import { renderBattleStatsPanel } from './BattleStatsPresentation';

describe('BattleStatsPresentation', () => {
  it('renderiza geral, heróis e skills', () => {
    const html = renderBattleStatsPanel({
      damageDealt: 1200,
      healingDone: 340,
      damageTaken: 510,
      damageMitigated: 220,
      critCount: 4,
      damageByElement: {
        physical: 800,
        fire: 400,
        cold: 0,
        lightning: 0,
        air: 0,
      },
      heroes: [
        {
          heroId: 'h1',
          name: 'Nix',
          damageDealt: 900,
          healingDone: 0,
          damageTaken: 200,
          damageMitigated: 80,
          basicAttackUses: 12,
          skillUses: 5,
          damageByElement: {
            physical: 100,
            fire: 800,
            cold: 0,
            lightning: 0,
            air: 0,
          },
        },
      ],
      skills: [
        {
          heroId: 'h1',
          heroName: 'Nix',
          skillId: 'fireball',
          skillName: 'Bola de Fogo',
          uses: 5,
          damageDealt: 700,
          healingDone: 0,
        },
      ],
    });

    expect(html).toContain('battle-stats-panel');
    expect(html).toContain('Dano causado');
    expect(html).toContain('1200');
    expect(html).toContain('Dano mitigado');
    expect(html).toContain('220');
    expect(html).toContain('Fogo');
    expect(html).toContain('Nix');
    expect(html).toContain('Bola de Fogo');
    expect(html).toContain('12 atk');
    expect(html).toContain('battle-stats-hero-card');
    expect(html).not.toContain('battle-stats-hero-elements');
  });
});
