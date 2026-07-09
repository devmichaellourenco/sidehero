import { describe, expect, it } from 'vitest';
import { Enemy } from '../entities/Enemy';
import { Hero } from '../entities/Hero';
import { Gear } from '../entities/Gear';
import { getEnemyCombatBaseline } from './EnemyCombatBaselines';
import { resolveEnemyAttackSpeed } from './EnemyCombatBalance';
import { CombatProfileProvider } from './CombatProfileProvider';

describe('CombatProfileProvider', () => {
  const profiles = new CombatProfileProvider();

  it('aplica redução de cooldown positiva no cast speed efetivo', () => {
    const hero = Hero.createStarter('h1', 'sorcerer', 'Mira').equip(
      Gear.create({
        id: 'ring-cdr',
        name: 'Anel Rápido',
        templateId: 'copper_ring',
        slot: 'accessory',
        rarity: 'rare',
        attackBonus: 0,
        defenseBonus: 0,
        healthBonus: 0,
        cooldownReductionBonus: 20,
      }),
    );

    const profile = profiles.forHero(hero);
    expect(profile.castSpeed).toBeGreaterThan(1);
  });

  it('limita penalidade de velocidade de ataque negativa', () => {
    const hero = Hero.createStarter('h1', 'knight', 'Tank').equip(
      Gear.create({
        id: 'heavy-axe',
        name: 'Machado Pesado',
        templateId: 'pixel_axe',
        slot: 'weapon',
        rarity: 'rare',
        attackBonus: 12,
        defenseBonus: 0,
        healthBonus: 0,
        attackSpeedBonus: -0.8,
      }),
    );

    const profile = profiles.forHero(hero);
    expect(profile.attackSpeed).toBeGreaterThanOrEqual(0.35);
  });

  it('herói inicial ataca mais devagar que o baseline de classe', () => {
    const hero = Hero.createStarter('h1', 'knight', 'Galneon');
    const baseline = profiles.forHero(hero);
    const classBaselineAspd = 0.58;

    expect(baseline.attackSpeed).toBeLessThan(classBaselineAspd);
    expect(baseline.attackSpeed).toBeCloseTo(0.536, 2);
  });

  it('aumenta ASPD com pontos em DEX', () => {
    const starter = profiles.forHero(Hero.createStarter('h1', 'knight', 'A'));
    const invested = profiles.forHero(
      Hero.restore({
        ...Hero.createStarter('h2', 'knight', 'B').toProps(),
        allocatedAttributes: { str: 0, dex: 15, int: 0 },
      }),
    );

    expect(invested.attackSpeed).toBeGreaterThan(starter.attackSpeed);
  });

  it('inimigo inicial ataca mais devagar que o baseline de tier', () => {
    const goblin = Enemy.forStage(1);
    const profile = profiles.forEnemy(goblin);
    const tierBaseline = getEnemyCombatBaseline(goblin.enemyType).attackSpeed;

    expect(profile.attackSpeed).toBeLessThan(tierBaseline);
    expect(profile.attackSpeed).toBeCloseTo(resolveEnemyAttackSpeed(tierBaseline, 1), 4);
  });

  it('inimigo acelera com tier mais alto', () => {
    const early = profiles.forEnemy(Enemy.forStage(3));
    const late = profiles.forEnemy(Enemy.forStage(40));

    expect(late.attackSpeed).toBeGreaterThan(early.attackSpeed);
  });
});
