import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { CombatActionExecutor } from './CombatActionExecutor';
import { CombatStatusEffectTracker } from './CombatStatusEffectTracker';

describe('CombatActionExecutor', () => {
  const executor = new CombatActionExecutor();

  it('aplica blessing como buff de ataque em todos os aliados', () => {
    const priest = Hero.createStarter('p1', 'priest', 'Elara');
    const knight = Hero.createStarter('k1', 'knight', 'Galneon');
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

  it('emite floating de cura no aliado curado, não no conjurador', () => {
    const priest = Hero.createStarter('p1', 'priest', 'Elara');
    const damagedKnight = Hero.createStarter('k1', 'knight', 'Galneon').takeDamage(50);
    const hpBeforeHeal = damagedKnight.currentHealth;
    const enemy = Enemy.forStage(1);

    const result = executor.execute(
      {
        skillId: 'minor_heal',
        skillName: 'Cura Menor',
        kind: 'heal_ally',
        targeting: 'single_ally',
        power: 20,
        targetHeroId: 'k1',
      },
      'Elara',
      [priest, damagedKnight],
      [enemy],
    );

    expect(result.floatingEvents).toHaveLength(1);
    expect(result.floatingEvents[0]).toMatchObject({
      target: 'hero',
      targetId: 'k1',
      kind: 'heal',
      amount: 20,
    });
    expect(result.heroes.find((hero) => hero.id === 'k1')?.currentHealth).toBe(hpBeforeHeal + 20);
  });

  it('emite floating de cura para cada aliado em cura em área', () => {
    const priest = Hero.createStarter('p1', 'priest', 'Elara').takeDamage(30);
    const knight = Hero.createStarter('k1', 'knight', 'Galneon').takeDamage(40);
    const enemy = Enemy.forStage(1);

    const result = executor.execute(
      {
        skillId: 'group_heal',
        skillName: 'Cura em Grupo',
        kind: 'heal_ally',
        targeting: 'all_allies',
        power: 15,
        targetHeroIds: ['p1', 'k1'],
      },
      'Elara',
      [priest, knight],
      [enemy],
    );

    expect(result.floatingEvents).toHaveLength(2);
    expect(result.floatingEvents.map((entry) => entry.targetId).sort()).toEqual(['k1', 'p1']);
    expect(result.floatingEvents.every((entry) => entry.kind === 'heal' && entry.target === 'hero')).toBe(
      true,
    );
  });

  it('debuff de defesa aumenta dano recebido pelo herói', () => {
    const knight = Hero.createStarter('k1', 'knight', 'Galneon');
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
