import { describe, expect, it } from 'vitest';
import { Hero } from '../entities/Hero';
import { SkillService } from './SkillService';

describe('SkillService — ascensão', () => {
  const service = new SkillService();

  it('expõe sub-árvore apenas após ascender', () => {
    const knight = Hero.createStarter('k1', 'knight', 'Galneon');
    expect(service.buildAscensionTree(knight)).toHaveLength(0);

    const ascended = Hero.restore({
      ...knight.toProps(),
      ascensionId: 'knight_guardian',
      unspentAscensionPoints: 2,
    });

    const tree = service.buildAscensionTree(ascended);
    expect(tree).toHaveLength(2);
    expect(tree.map((node) => node.definition.id)).toContain('guardian_strike');
  });

  it('aloca ponto de ascensão em skill da sub-árvore', () => {
    const ascended = Hero.restore({
      ...Hero.createStarter('k1', 'knight', 'Galneon').toProps(),
      ascensionId: 'knight_guardian',
      unspentAscensionPoints: 1,
    });

    expect(service.canAllocateAscension(ascended, 'guardian_strike')).toBe(true);

    const updated = service.allocateAscension(ascended, 'guardian_strike');
    expect(updated.toProps().skillRanks.guardian_strike).toBe(1);
    expect(updated.toProps().unspentAscensionPoints).toBe(0);
  });
});
