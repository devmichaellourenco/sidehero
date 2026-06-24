import { describe, expect, it } from 'vitest';
import { Hero } from '../entities/Hero';
import { SkillService } from './SkillService';

describe('SkillService — ascensão', () => {
  const service = new SkillService();

  it('expõe sub-árvore apenas após evoluir', () => {
    const knight = Hero.createStarter('k1', 'knight', 'Galneon');
    expect(service.buildAscensionTree(knight)).toHaveLength(0);

    const ascended = Hero.restore({
      ...knight.toProps(),
      ascensionId: 'knight_military_guerreiro',
      unspentAscensionPoints: 2,
    });

    const tree = service.buildAscensionTree(ascended);
    expect(tree.length).toBeGreaterThanOrEqual(3);
    expect(tree.map((node) => node.definition.id)).toContain('mil_guer_cleave');
  });

  it('acumula skills de tiers anteriores no mesmo caminho', () => {
    const general = Hero.restore({
      ...Hero.createStarter('k1', 'knight', 'Galneon').toProps(),
      ascensionId: 'knight_military_general',
      unspentAscensionPoints: 0,
    });

    const ids = service.buildAscensionTree(general).map((node) => node.definition.id);
    expect(ids).toContain('mil_guer_cleave');
    expect(ids).toContain('mil_gen_decree');
  });

  it('aloca ponto de ascensão em skill da sub-árvore', () => {
    const ascended = Hero.restore({
      ...Hero.createStarter('k1', 'knight', 'Galneon').toProps(),
      ascensionId: 'knight_martial_gladiador',
      unspentAscensionPoints: 1,
    });

    expect(service.canAllocateAscension(ascended, 'mar_gla_slash')).toBe(true);

    const updated = service.allocateAscension(ascended, 'mar_gla_slash');
    expect(updated.toProps().skillRanks.mar_gla_slash).toBe(1);
    expect(updated.toProps().unspentAscensionPoints).toBe(0);
  });

  it('acumula skills de tiers anteriores no caminho inato da Nix', () => {
    const filha = Hero.restore({
      ...Hero.createStarter('s1', 'sorcerer', 'Nix').toProps(),
      ascensionId: 'sorcerer_innate_filha_eter',
      unspentAscensionPoints: 0,
    });

    const ids = service.buildAscensionTree(filha).map((node) => node.definition.id);
    expect(ids).toContain('inn_fei_spark');
    expect(ids).toContain('inn_fil_ether');
  });

  it('acumula skills de tiers anteriores no caminho sagrado da Elara', () => {
    const santa = Hero.restore({
      ...Hero.createStarter('p1', 'priest', 'Elara').toProps(),
      ascensionId: 'priest_sacred_santa',
      unspentAscensionPoints: 0,
    });

    const ids = service.buildAscensionTree(santa).map((node) => node.definition.id);
    expect(ids).toContain('sag_clr_light');
    expect(ids).toContain('sag_san_judgment');
  });
});
