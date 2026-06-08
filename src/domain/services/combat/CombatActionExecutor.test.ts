import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { CombatActionExecutor } from './CombatActionExecutor';
import { CombatStatusEffectTracker } from './CombatStatusEffectTracker';

describe('CombatActionExecutor', () => {
  const executor = new CombatActionExecutor();

  it('aplica blessing como buff de ataque em todos os aliados', () => {
    const priest = Hero.createStarter('p1', 'priest', 'Elara');
    const knight = Hero.createStarter('k1', 'knight', 'Arthos');
    const enemy = Enemy.forStage(1);

    const result = executor.execute(
      {
        skillId: 'blessing',
        skillName: 'Bênção',
        kind: 'buff_attack',
        targeting: 'all_allies',
        power: 5,
        effectDurationTurns: 3,
        targetHeroIds: ['p1', 'k1'],
      },
      'Elara',
      [priest, knight],
      [enemy],
    );

    expect(result.statusApplications).toHaveLength(2);
    expect(result.statusApplications[0]).toMatchObject({
      kind: 'buff_attack',
      magnitude: 5,
      durationTurns: 3,
    });
    expect(result.event).toContain('Bênção');
  });

  it('debuff de defesa aumenta dano recebido pelo herói', () => {
    const knight = Hero.createStarter('k1', 'knight', 'Arthos');
    const enemy = Enemy.forStage(1);
    const statusEffects = CombatStatusEffectTracker.fromMap({}).apply({
      combatantKey: 'hero:k1',
      skillId: 'wraith_curse',
      kind: 'debuff_defense',
      magnitude: 8,
      durationTurns: 2,
    });

    const withoutDebuff = executor.execute(
      {
        skillId: 'basic_attack',
        skillName: 'Ataque Básico',
        kind: 'damage_physical',
        targeting: 'single_ally',
        power: 20,
        targetHeroId: 'k1',
      },
      'Wraith',
      [knight],
      [enemy],
      CombatStatusEffectTracker.fromMap({}),
    );

    const withDebuff = executor.execute(
      {
        skillId: 'basic_attack',
        skillName: 'Ataque Básico',
        kind: 'damage_physical',
        targeting: 'single_ally',
        power: 20,
        targetHeroId: 'k1',
      },
      'Wraith',
      [knight],
      [enemy],
      statusEffects,
    );

    const healthWithout = withoutDebuff.heroes[0].currentHealth;
    const healthWith = withDebuff.heroes[0].currentHealth;
    expect(healthWith).toBeLessThan(healthWithout);
  });
});
