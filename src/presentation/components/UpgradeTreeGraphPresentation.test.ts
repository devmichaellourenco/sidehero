import { describe, expect, it } from 'vitest';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import {
  buildBranchEdges,
  buildPositionedNodes,
  pickDefaultBranch,
  resolveUpgradeParentIds,
} from './UpgradeTreeGraphPresentation';

function node(partial: Partial<UpgradeNodeDto> & Pick<UpgradeNodeDto, 'id' | 'branch'>): UpgradeNodeDto {
  return {
    feature: 'auto_battle',
    level: 1,
    name: partial.id,
    description: 'desc',
    cost: 100,
    status: 'locked',
    canAfford: false,
    requirements: [],
    ...partial,
  };
}

describe('UpgradeTreeGraphPresentation', () => {
  it('resolve pais via requisito upgrade_level', () => {
    expect(resolveUpgradeParentIds('auto_battle_3')).toEqual(['auto_battle_2']);
    expect(resolveUpgradeParentIds('open_all_chests_1')).toEqual(['auto_open_chests_1']);
  });

  it('monta arestas apenas entre nodos do mesmo ramo visível', () => {
    const nodes = [
      node({ id: 'auto_open_chests_1', branch: 'chests' }),
      node({ id: 'open_all_chests_1', branch: 'chests' }),
      node({ id: 'open_all_chests_2', branch: 'chests' }),
    ];

    expect(buildBranchEdges(nodes)).toEqual([
      { fromId: 'auto_open_chests_1', toId: 'open_all_chests_1' },
      { fromId: 'open_all_chests_1', toId: 'open_all_chests_2' },
    ]);
  });

  it('posiciona nodos com layout do ramo', () => {
    const nodes = [
      node({ id: 'auto_battle_2', branch: 'combat' }),
      node({ id: 'auto_battle_3', branch: 'combat' }),
    ];

    const positioned = buildPositionedNodes('combat', nodes);
    expect(positioned).toHaveLength(2);
    expect(positioned[0].x).toBeLessThan(positioned[1].x);
  });

  it('prioriza ramo com melhoria disponível', () => {
    const nodes = [
      node({ id: 'auto_battle_2', branch: 'combat', status: 'locked' }),
      node({ id: 'auto_open_chests_1', branch: 'chests', status: 'available' }),
    ];

    expect(pickDefaultBranch(nodes)).toBe('chests');
  });
});
