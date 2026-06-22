import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { SkillCooldownTracker } from './SkillCooldownTracker';
import { CombatSkillBarResolver } from './CombatSkillBarResolver';

describe('CombatSkillBarResolver', () => {
  const resolver = new CombatSkillBarResolver();

  it('lista todas as skills do goblin com cooldown visível', () => {
    const goblin = Enemy.restore({
      ...Enemy.forStage(2).toProps(),
      id: 'goblin-1',
      enemyType: 'goblin_raider',
      name: 'Goblin Lv.2',
    });
    const hero = Hero.createStarter('h1', 'knight', 'Galneon');
    const cooldowns = SkillCooldownTracker.fromMap({
      'enemy:goblin-1': { goblin_stab: 2 },
    });

    const bar = resolver.resolveForEnemy(goblin, [hero], [goblin], cooldowns, {
      isActiveTurn: false,
    });

    expect(bar.length).toBeGreaterThan(1);
    expect(bar.some((entry) => entry.skillId === 'basic_attack')).toBe(true);
    expect(bar.find((entry) => entry.skillId === 'goblin_stab')?.secondsRemaining).toBe(2);
  });

  it('destaca próxima e fila quando duas skills prontas no turno ativo', () => {
    const sorcerer = Hero.createStarter('s1', 'sorcerer', 'Nix');
    const hero = Hero.createStarter('h1', 'knight', 'Galneon');
    const enemy = Enemy.forStage(2);
    const cooldowns = SkillCooldownTracker.fromMap({});

    const bar = resolver.resolveForHero(sorcerer, [sorcerer, hero], [enemy], cooldowns, {
      isActiveTurn: true,
    });

    const highlighted = bar.filter((entry) => entry.highlight !== 'none');
    expect(highlighted.length).toBeGreaterThanOrEqual(1);
    expect(highlighted[0].highlight).toBe('next');
  });
});
