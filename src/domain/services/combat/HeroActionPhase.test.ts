import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { HeroActionPhase } from './HeroActionPhase';

describe('HeroActionPhase', () => {
  const phase = new HeroActionPhase();

  it('aplica dano mágico ao inimigo', () => {
    let sorcerer = Hero.createStarter('s1', 'sorcerer', 'Lyra');
    sorcerer = Hero.restore({
      ...sorcerer.toProps(),
      skillRanks: { arcane_bolt: 1 },
      equippedSkillIds: ['arcane_bolt'],
    });

    const enemy = Enemy.forStage(1);
    const result = phase.execute([sorcerer], enemy);

    expect(result.enemy.stats.currentHealth).toBeLessThan(enemy.stats.currentHealth);
    expect(result.events.some((e) => e.includes('Raio Arcano'))).toBe(true);
    expect(result.floatingEvents).toEqual([
      expect.objectContaining({ target: 'enemy', kind: 'damage', amount: expect.any(Number) }),
    ]);
  });

  it('cura aliado ferido e persiste HP na party', () => {
    let priest = Hero.createStarter('p1', 'priest', 'Elara');
    priest = Hero.restore({
      ...priest.toProps(),
      skillRanks: { minor_heal: 1 },
      equippedSkillIds: ['minor_heal'],
    });

    let knight = Hero.createStarter('k1', 'knight', 'Arthos');
    knight = Hero.restore({
      ...knight.toProps(),
      currentHealth: 15,
    });

    const enemy = Enemy.forStage(1);
    const result = phase.execute([priest, knight], enemy);

    const healedKnight = result.heroes.find((h) => h.id === 'k1')!;
    expect(healedKnight.currentHealth).toBeGreaterThan(15);
    expect(result.events.some((e) => e.includes('Cura Menor'))).toBe(true);
    expect(result.floatingEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: 'hero', targetId: 'k1', kind: 'heal', amount: expect.any(Number) }),
      ]),
    );
  });
});
