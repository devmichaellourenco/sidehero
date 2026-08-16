import { describe, expect, it } from 'vitest';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import {
  buildEdgePath,
  buildPositionedNodes,
  buildUpgradeTreeEdges,
  findFocusNodeId,
  findSiblingBranchConflicts,
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
  it('resolve pais via parents explícitos ou requisito upgrade_level', () => {
    expect(resolveUpgradeParentIds('auto_battle_3')).toEqual(['auto_battle_2']);
    expect(resolveUpgradeParentIds('auto_battle_2')).toEqual(['battle_stats_1']);
    expect(resolveUpgradeParentIds('battle_stats_1')).toEqual([]);
    expect(resolveUpgradeParentIds('open_all_chests_1')).toEqual(['battle_stats_1']);
    // AUTO-ABRIR BAÚS DESATIVADO (2026-08)
    expect(resolveUpgradeParentIds('auto_open_chests_1')).toEqual([]);
    expect(resolveUpgradeParentIds('open_all_chests_2')).toEqual([]);
    expect(resolveUpgradeParentIds('hero_unlock_knight')).toEqual(['battle_stats_1']);
    expect(resolveUpgradeParentIds('hero_unlock_priest')).toEqual(['hero_unlock_knight']);
    expect(resolveUpgradeParentIds('hero_unlock_berserker')).toEqual(['hero_unlock_priest']);
    expect(resolveUpgradeParentIds('hero_unlock_archer')).toEqual(['hero_unlock_berserker']);
    expect(resolveUpgradeParentIds('hero_unlock_paladin')).toEqual(['hero_unlock_archer']);
    // OFFLINE PROGRESS DESATIVADO (2026-07)
    expect(resolveUpgradeParentIds('background_tick_1')).toEqual([]);
    // OTIMIZAR EQUIPE DESATIVADO (2026-08)
    expect(resolveUpgradeParentIds('optimize_loadout_1')).toEqual([]);
    expect(resolveUpgradeParentIds('battle_skill_slot_2')).toEqual(['battle_stats_1']);
    expect(resolveUpgradeParentIds('shop_refresh_1')).toEqual(['auto_battle_2']);
    expect(resolveUpgradeParentIds('log_filter_1')).toEqual(['auto_battle_3']);
  });

  it('monta arestas entre nodos visíveis, inclusive entre ramos', () => {
    const nodes = [
      node({ id: 'battle_stats_1', branch: 'qol' }),
      node({ id: 'auto_battle_2', branch: 'combat' }),
      node({ id: 'battle_skill_slot_2', branch: 'combat' }),
      node({ id: 'hero_unlock_knight', branch: 'heroes' }),
      node({ id: 'hero_unlock_priest', branch: 'heroes' }),
      node({ id: 'hero_unlock_berserker', branch: 'heroes' }),
    ];

    expect(buildUpgradeTreeEdges(nodes)).toEqual(
      expect.arrayContaining([
        { fromId: 'battle_stats_1', toId: 'auto_battle_2' },
        { fromId: 'battle_stats_1', toId: 'battle_skill_slot_2' },
        { fromId: 'battle_stats_1', toId: 'hero_unlock_knight' },
        { fromId: 'hero_unlock_knight', toId: 'hero_unlock_priest' },
        { fromId: 'hero_unlock_priest', toId: 'hero_unlock_berserker' },
      ]),
    );
    expect(buildUpgradeTreeEdges(nodes)).toHaveLength(5);
  });

  it('acusa irmãos que saem do mesmo pai na mesma direção', () => {
    // battle_stats_1 → open_all_chests_1 é leste; hero_unlock_knight é sul.
    expect(
      findSiblingBranchConflicts([
        { fromId: 'battle_stats_1', toId: 'open_all_chests_1' },
        { fromId: 'battle_stats_1', toId: 'hero_unlock_knight' },
      ]),
    ).toEqual([]);

    // item_stash_2 e open_all_chests_1 estão ambos a leste de seus pais, mas o pai
    // aqui é o mesmo nodo — direção duplicada.
    const conflicts = findSiblingBranchConflicts([
      { fromId: 'battle_stats_1', toId: 'open_all_chests_1' },
      { fromId: 'battle_stats_1', toId: 'item_stash_2' },
    ]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].childIds).toEqual(['open_all_chests_1', 'item_stash_2']);
  });

  it('desenha toda aresta como linha reta', () => {
    const root = { node: node({ id: 'root', branch: 'qol' }), x: 100, y: 100 };
    const child = { node: node({ id: 'child', branch: 'combat' }), x: 220, y: 220 };

    const path = buildEdgePath(root, child);

    expect(path).toMatch(/^M [\d.]+ [\d.]+ L [\d.]+ [\d.]+$/);
  });

  it('posiciona nodos com layout unificado', () => {
    const nodes = [
      node({ id: 'auto_battle_3', branch: 'combat' }),
      node({ id: 'auto_battle_2', branch: 'combat' }),
    ];

    const positioned = buildPositionedNodes(nodes);
    expect(positioned).toHaveLength(2);
    expect(positioned.find((entry) => entry.node.id === 'auto_battle_3')!.x).toBeLessThan(
      positioned.find((entry) => entry.node.id === 'auto_battle_2')!.x,
    );
  });

  it('foca primeiro nodo disponível, depois Ready, depois bloqueado', () => {
    const nodes = [
      node({ id: 'auto_battle_2', branch: 'combat', status: 'locked' }),
      node({ id: 'battle_stats_1', branch: 'qol', status: 'available' }),
      node({ id: 'shop_refresh_1', branch: 'economy', status: 'ready' }),
    ];

    expect(findFocusNodeId(nodes)).toBe('battle_stats_1');

    const onlyReady = [
      node({ id: 'auto_battle_2', branch: 'combat', status: 'locked' }),
      node({ id: 'shop_refresh_1', branch: 'economy', status: 'ready' }),
    ];
    expect(findFocusNodeId(onlyReady)).toBe('shop_refresh_1');
  });
});
