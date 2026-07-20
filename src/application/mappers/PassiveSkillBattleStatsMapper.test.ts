import { describe, expect, it } from 'vitest';
import { Hero } from '../../domain/entities/Hero';
import { buildPassiveSkillBattleStats } from './PassiveSkillBattleStatsMapper';

describe('buildPassiveSkillBattleStats', () => {
  it('esquiva mostra percentual por level e no level atual', () => {
    const base = Hero.createStarter('h1', 'knight', 'Galneon');
    const hero = Hero.restore({
      ...base.toProps(),
      skillRanks: { ...base.toProps().skillRanks, evasion: 2 },
      equippedSkillIds: ['basic_attack', 'evasion'],
    });

    const stats = buildPassiveSkillBattleStats(hero, 'evasion');
    const dodge = stats.find((entry) => entry.label === 'Esquiva');

    expect(stats.some((entry) => entry.label === 'Tipo' && entry.value.includes('Passiva'))).toBe(true);
    expect(dodge?.value).toBe('+5.0% (level 2)');
    expect(dodge?.tooltipLines?.some((line) => line.text.includes('2.50%'))).toBe(true);
  });

  it('vitalidade mostra HP derivado de STR', () => {
    const base = Hero.createStarter('h2', 'knight', 'Galneon');
    const hero = Hero.restore({
      ...base.toProps(),
      skillRanks: { ...base.toProps().skillRanks, vitality: 1 },
      equippedSkillIds: ['basic_attack', 'vitality'],
    });
    const str = hero.totalAttributes.str;
    const expectedHp = str * 2;

    const stats = buildPassiveSkillBattleStats(hero, 'vitality');
    const hp = stats.find((entry) => entry.label === 'Vida máxima');

    expect(hp?.value).toBe(`+${expectedHp.toLocaleString('pt-BR')} HP (level 1)`);
    expect(hp?.tooltipLines?.some((line) => line.text.includes(`STR ${str}`))).toBe(true);
  });

  it('pele de ferro e escudo de mana detalham redução e bloqueio', () => {
    const base = Hero.createStarter('h3', 'knight', 'Galneon');
    const knight = Hero.restore({
      ...base.toProps(),
      skillRanks: { ...base.toProps().skillRanks, iron_skin: 3 },
      equippedSkillIds: ['basic_attack', 'iron_skin'],
    });
    const sorcerer = Hero.createStarter('h4', 'sorcerer', 'Nix');
    const mage = Hero.restore({
      ...sorcerer.toProps(),
      skillRanks: { ...sorcerer.toProps().skillRanks, mana_shield: 2 },
      equippedSkillIds: ['basic_attack', 'mana_shield'],
    });

    const iron = buildPassiveSkillBattleStats(knight, 'iron_skin').find(
      (entry) => entry.label === 'Redução de dano',
    );
    const shield = buildPassiveSkillBattleStats(mage, 'mana_shield').find(
      (entry) => entry.label === 'Bloqueio',
    );

    expect(iron?.value).toBe('+12.0% (level 3)');
    expect(shield?.value).toBe('+6.0% (level 2)');
  });
});
