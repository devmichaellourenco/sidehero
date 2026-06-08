import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { Stats } from '../../value-objects/Stats';
import { SkillCooldownTracker } from './SkillCooldownTracker';
import { CombatSkillSelector } from './CombatSkillSelector';

describe('CombatSkillSelector', () => {
  const selector = new CombatSkillSelector();
  const enemies = [Enemy.forStage(1)];
  const emptyCooldowns = SkillCooldownTracker.fromMap({});

  it('usa ataque básico equipado quando nenhuma outra skill está pronta', () => {
    const hero = Hero.createStarter('h1', 'sorcerer', 'Lyra');
    const selected = selector.selectHeroAction(hero, [hero], enemies, emptyCooldowns);

    expect(hero.toProps().equippedSkillIds).toContain('basic_attack');
    expect(selected?.skillId).toBe('basic_attack');
    expect(selected?.action.targeting).toBe('single_enemy');
    expect(selected?.action.power).toBe(hero.attack);
  });

  it('prioriza cura quando aliado está ferido e skill está pronta', () => {
    let priest = Hero.createStarter('p1', 'priest', 'Elara');
    priest = Hero.restore({
      ...priest.toProps(),
      skillRanks: { minor_heal: 1 },
      equippedSkillIds: ['basic_attack', 'minor_heal'],
    });

    let knight = Hero.createStarter('k1', 'knight', 'Arthos');
    knight = Hero.restore({
      ...knight.toProps(),
      currentHealth: 10,
    });

    const selected = selector.selectHeroAction(priest, [priest, knight], enemies, emptyCooldowns);

    expect(selected?.skillId).toBe('minor_heal');
    expect(selected?.action.targetHeroId).toBe('k1');
  });

  it('fireball respeita cooldown inicial e prioridade quando pronta', () => {
    let sorcerer = Hero.createStarter('s1', 'sorcerer', 'Lyra');
    sorcerer = Hero.restore({
      ...sorcerer.toProps(),
      skillRanks: { fireball: 1, arcane_bolt: 1 },
      equippedSkillIds: ['basic_attack', 'fireball', 'arcane_bolt'],
    });

    const charging = SkillCooldownTracker.fromMap({
      'hero:s1': { fireball: 2 },
    });
    const chargingPick = selector.selectHeroAction(sorcerer, [sorcerer], enemies, charging);
    expect(chargingPick?.skillId).toBe('arcane_bolt');

    const ready = SkillCooldownTracker.fromMap({});
    const readyPick = selector.selectHeroAction(sorcerer, [sorcerer], enemies, ready);
    expect(readyPick?.skillId).toBe('fireball');
  });

  it('inquisitor_judgment mira no inimigo com mais vida', () => {
    let priest = Hero.createStarter('p1', 'priest', 'Elara');
    priest = Hero.restore({
      ...priest.toProps(),
      skillRanks: { inquisitor_judgment: 1 },
      equippedSkillIds: ['basic_attack', 'inquisitor_judgment'],
    });

    const weak = Enemy.restore({
      ...Enemy.forStage(1).toProps(),
      id: 'weak-enemy',
      stats: Stats.create({
        attack: 10,
        defense: 4,
        maxHealth: 60,
        currentHealth: 15,
      }),
    });
    const tough = Enemy.restore({
      ...Enemy.forStage(2).toProps(),
      id: 'tough-enemy',
    });

    const heroSelected = selector.selectHeroAction(
      priest,
      [priest],
      [weak, tough],
      emptyCooldowns,
    );

    expect(heroSelected?.skillId).toBe('inquisitor_judgment');
    expect(heroSelected?.action.targetEnemyId).toBe('tough-enemy');
  });
});
