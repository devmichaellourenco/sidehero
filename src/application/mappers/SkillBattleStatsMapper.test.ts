import { describe, expect, it } from 'vitest';
import { Gear } from '../../domain/entities/Gear';
import { Hero } from '../../domain/entities/Hero';
import { buildSkillBattleStats } from './SkillBattleStatsMapper';

describe('buildSkillBattleStats — throughput alinhado ao combate', () => {
  it('inclui DPS finito para ataque básico', () => {
    const hero = Hero.createStarter('h1', 'knight', 'Galneon');
    const stats = buildSkillBattleStats(hero, 'basic_attack', 'str');
    const dps = stats.find((entry) => entry.label === 'DPS estimado');

    expect(dps?.value).toMatch(/^~\d+(\.\d+)? \(ataque contínuo\)$/);
    expect(dps?.emphasize).toBe(true);
    expect(dps?.tooltipLines?.length).toBeGreaterThan(3);
    expect(stats.some((entry) => entry.label === 'APS efetiva')).toBe(true);
    expect(stats.every((entry) => (entry.tooltipLines?.length ?? 0) > 0)).toBe(true);
  });

  it('inclui DPS finito para skill de dano e mostra recarga com CDR quando há gear', () => {
    const base = Hero.createStarter('h2', 'sorcerer', 'Nix');
    const wand = Gear.create({
      id: 'cdr-wand',
      name: 'Cajado CDR',
      templateId: 'staff',
      slot: 'weapon',
      rarity: 'rare',
      attackBonus: 0,
      defenseBonus: 0,
      healthBonus: 0,
      cooldownReductionBonus: 20,
      requirements: { minLevel: 1 },
    });
    const hero = Hero.restore({
      ...base.toProps(),
      equippedSkillIds: ['basic_attack', 'fireball'],
      skillRanks: { ...base.toProps().skillRanks, fireball: 2 },
      equipment: { weapon: wand, armor: null, accessory: null },
    });

    const stats = buildSkillBattleStats(hero, 'fireball', 'int');
    const dps = stats.find((entry) => entry.label === 'DPS estimado');
    const reload = stats.find((entry) => entry.label === 'Recarga');
    const poder = stats.find((entry) => entry.label === 'Poder');

    expect(dps?.value).toMatch(/^~\d+(\.\d+)? \(cast contínuo da skill\)$/);
    expect(reload?.value).toMatch(/CDR/);
    expect(poder?.tooltipLines?.some((line) => line.text.includes('multiplicador'))).toBe(true);
    expect(stats.some((entry) => entry.label === 'Casts/s')).toBe(true);
    expect(stats.some((entry) => entry.label === 'Fator de crit')).toBe(true);
  });
});
