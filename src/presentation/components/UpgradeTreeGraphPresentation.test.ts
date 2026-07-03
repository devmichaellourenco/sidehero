import { describe, expect, it } from 'vitest';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import {
  buildPositionedNodes,
  buildUpgradeTreeEdges,
  findFocusNodeId,
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
    expect(resolveUpgradeParentIds('auto_battle_2')).toEqual(['optimize_loadout_1']);
    expect(resolveUpgradeParentIds('open_all_chests_1')).toEqual(['auto_open_chests_1']);
    expect(resolveUpgradeParentIds('auto_open_chests_1')).toEqual(['optimize_loadout_1']);
    expect(resolveUpgradeParentIds('hero_unlock_berserker')).toEqual(['auto_battle_2']);
    expect(resolveUpgradeParentIds('hero_unlock_paladin')).toEqual(['hero_unlock_berserker']);
    expect(resolveUpgradeParentIds('background_tick_1')).toEqual(['auto_battle_2']);
    expect(resolveUpgradeParentIds('battle_skill_slot_2')).toEqual(['optimize_loadout_1']);
    expect(resolveUpgradeParentIds('shop_refresh_1')).toEqual(['auto_battle_2']);
    expect(resolveUpgradeParentIds('log_filter_1')).toEqual(['auto_battle_3']);
  });

  it('monta arestas entre nodos visíveis, inclusive entre ramos', () => {
    const nodes = [
      node({ id: 'optimize_loadout_1', branch: 'equipment' }),
      node({ id: 'auto_battle_2', branch: 'combat' }),
      node({ id: 'background_tick_1', branch: 'combat' }),
      node({ id: 'battle_skill_slot_2', branch: 'combat' }),
      node({ id: 'hero_unlock_berserker', branch: 'heroes' }),
      node({ id: 'hero_unlock_paladin', branch: 'heroes' }),
    ];

    expect(buildUpgradeTreeEdges(nodes)).toEqual(
      expect.arrayContaining([
        { fromId: 'optimize_loadout_1', toId: 'auto_battle_2' },
        { fromId: 'optimize_loadout_1', toId: 'battle_skill_slot_2' },
        { fromId: 'auto_battle_2', toId: 'background_tick_1' },
        { fromId: 'auto_battle_2', toId: 'hero_unlock_berserker' },
        { fromId: 'hero_unlock_berserker', toId: 'hero_unlock_paladin' },
      ]),
    );
    expect(buildUpgradeTreeEdges(nodes)).toHaveLength(5);
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

  it('foca primeiro nodo disponível, depois pronto, depois bloqueado', () => {
    const nodes = [
      node({ id: 'auto_battle_2', branch: 'combat', status: 'locked' }),
      node({ id: 'optimize_loadout_1', branch: 'equipment', status: 'available' }),
      node({ id: 'shop_refresh_1', branch: 'economy', status: 'ready' }),
    ];

    expect(findFocusNodeId(nodes)).toBe('optimize_loadout_1');

    const onlyReady = [
      node({ id: 'auto_battle_2', branch: 'combat', status: 'locked' }),
      node({ id: 'shop_refresh_1', branch: 'economy', status: 'ready' }),
    ];
    expect(findFocusNodeId(onlyReady)).toBe('shop_refresh_1');
  });
});
