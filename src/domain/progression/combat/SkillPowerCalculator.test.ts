import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { getClassCombatBaseline } from '../../combat/ClassCombatBaselines';
import { resolveHeroAttributeAttackSpeed } from '../../combat/CombatSpeedScaling';
import { getEnemyCombatBaseline } from '../../combat/EnemyCombatBaselines';
import {
  applyEnemyDamageSkillPower,
  ENEMY_DAMAGE_SKILL_MULTIPLIER,
  ENEMY_HP_BALANCE_FACTOR,
  ENEMY_PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO,
  resolveEnemyAttackSpeed,
  resolveEnemyStageAttackSpeedBonus,
} from '../../combat/EnemyCombatBalance';
import { getHeroCombatSkill } from './HeroCombatSkillCatalog';
import { listEnemyCombatSkillsByType } from './EnemyCombatSkillCatalog';
import { SkillPowerCalculator } from './SkillPowerCalculator';

describe('EnemyCombatBalance', () => {
  it('aumenta HP base dos inimigos para compensar buff de skills dos heróis', () => {
    expect(ENEMY_HP_BALANCE_FACTOR).toBeGreaterThan(1);
  });

  it('ASPD inicial de inimigo é menor que o baseline de tier', () => {
    const baseline = getEnemyCombatBaseline('goblin_raider').attackSpeed;
    expect(resolveEnemyAttackSpeed(baseline, 1)).toBeLessThan(baseline);
  });

  it('ASPD de inimigo cresce com o tier da fase', () => {
    const baseline = getEnemyCombatBaseline('orc_warrior').attackSpeed;
    expect(resolveEnemyAttackSpeed(baseline, 40)).toBeGreaterThan(
      resolveEnemyAttackSpeed(baseline, 5),
    );
    expect(resolveEnemyStageAttackSpeedBonus(200)).toBe(
      resolveEnemyStageAttackSpeedBonus(500),
    );
  });

  it('skills físicas de inimigo respeitam piso em relação ao ATK', () => {
    const goblinStab = listEnemyCombatSkillsByType('goblin_raider').find(
      (skill) => skill.skillId === 'goblin_stab',
    )!;
    const attack = 14;
    const raw = goblinStab.basePower + 2;

    expect(applyEnemyDamageSkillPower(goblinStab, raw, attack)).toBe(
      Math.max(
        Math.floor(raw * ENEMY_DAMAGE_SKILL_MULTIPLIER),
        Math.floor(attack * ENEMY_PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO),
      ),
    );
  });
});

describe('SkillPowerCalculator', () => {
  const calculator = new SkillPowerCalculator();

  it('calcula poder de magia com scaling de INT', () => {
    let sorcerer = Hero.createStarter('s1', 'sorcerer', 'Nix');
    sorcerer = Hero.restore({
      ...sorcerer.toProps(),
      skillRanks: { fireball: 1 },
    });

    const profile = getHeroCombatSkill('fireball')!;
    const power = calculator.calculateForHero(profile, sorcerer);

    expect(power).toBeGreaterThan(profile.basePower);
    expect(power).toBeGreaterThan(sorcerer.attack);
  });

  it('skills físicas ficam acima do auto-ataque no nível inicial', () => {
    let knight = Hero.createStarter('k1', 'knight', 'Galneon');
    knight = Hero.restore({
      ...knight.toProps(),
      skillRanks: { power_attack: 1 },
    });

    const profile = getHeroCombatSkill('power_attack')!;
    const power = calculator.calculateForHero(profile, knight);

    expect(power).toBeGreaterThan(knight.attack);
  });

  it('aplica multiplicador de dano nas skills ofensivas de inimigo', () => {
    const goblin = Enemy.restore({
      ...Enemy.forStage(2).toProps(),
      enemyType: 'goblin_raider',
    });
    const dragon = Enemy.restore({
      ...Enemy.forStage(5).toProps(),
      enemyType: 'young_green_dragon',
    });

    const goblinStab = listEnemyCombatSkillsByType('goblin_raider').find(
      (skill) => skill.skillId === 'goblin_stab',
    )!;
    const dragonBreath = listEnemyCombatSkillsByType('young_green_dragon').find(
      (skill) => skill.skillId === 'dragon_breath',
    )!;
    const wildBite = listEnemyCombatSkillsByType('giant_rat').find(
      (skill) => skill.skillId === 'wild_bite',
    )!;

    expect(calculator.calculateForEnemy(goblinStab, goblin)).toBe(12);
    expect(calculator.calculateForEnemy(dragonBreath, dragon)).toBe(19);
    expect(calculator.calculateForEnemy(wildBite, Enemy.forStage(1))).toBe(11);
  });
});

describe('resolveHeroAttributeAttackSpeed', () => {
  it('começa mais lento que o baseline de classe puro', () => {
    const knight = Hero.createStarter('k1', 'knight', 'Galneon');
    const baseline = getClassCombatBaseline('knight').attackSpeed;

    expect(resolveHeroAttributeAttackSpeed(baseline, knight)).toBeLessThan(baseline);
  });

  it('acelera conforme DEX e STR aumentam', () => {
    const baseline = getClassCombatBaseline('knight').attackSpeed;
    const starter = Hero.createStarter('k1', 'knight', 'Galneon');
    const invested = Hero.restore({
      ...starter.toProps(),
      allocatedAttributes: { str: 10, dex: 10, int: 0 },
    });

    expect(resolveHeroAttributeAttackSpeed(baseline, invested)).toBeGreaterThan(
      resolveHeroAttributeAttackSpeed(baseline, starter),
    );
  });

  it('sorcerer não ganha ASPD de STR', () => {
    const baseline = getClassCombatBaseline('sorcerer').attackSpeed;
    const withStr = Hero.restore({
      ...Hero.createStarter('s1', 'sorcerer', 'Lyra').toProps(),
      allocatedAttributes: { str: 20, dex: 0, int: 0 },
    });
    const withoutStr = Hero.restore({
      ...Hero.createStarter('s1', 'sorcerer', 'Lyra').toProps(),
      allocatedAttributes: { str: 0, dex: 0, int: 20 },
    });

    expect(resolveHeroAttributeAttackSpeed(baseline, withStr)).toBe(
      resolveHeroAttributeAttackSpeed(baseline, withoutStr),
    );
  });
});
