import { afterEach, describe, expect, it } from 'vitest';
import { GameState } from '../entities/GameState';
import { Gold } from '../value-objects/Gold';
import { getCatalogUpgradeById } from './UpgradeCatalog';
import { setRuntimeUpgradeOverrides } from './UpgradeOverrides';
import { UpgradeService } from './UpgradeService';

describe('UpgradeService', () => {
  const service = new UpgradeService();

  function progressionReadyState(): GameState {
    return GameState.restore({
      ...GameState.initial().toProps(),
      stage: 5,
      gold: Gold.of(10_000).value(),
      totalBattlesWon: 10,
    });
  }

  function nodeStatus(state: GameState, id: string) {
    return service.buildTree(state).find((node) => node.definition.id === id)?.status;
  }

  it('tem apenas battle_stats_1 como raiz desbloqueável inicial', () => {
    const state = progressionReadyState();
    const roots = service
      .buildTree(state)
      .filter((node) => node.definition.parents.length === 0);

    expect(roots.map((node) => node.definition.id)).toEqual(['battle_stats_1']);
    expect(nodeStatus(state, 'battle_stats_1')).toBe('available');
    expect(nodeStatus(state, 'auto_battle_2')).toBe('locked');
    expect(nodeStatus(state, 'open_all_chests_1')).toBe('locked');
  });

  it('permite auto_battle_2 com tier implícito 1x antes da primeira compra', () => {
    const state = progressionReadyState().withUpgradeLevels({
      battle_stats: 1,
    });

    expect(nodeStatus(state, 'battle_stats_1')).toBe('owned');
    expect(nodeStatus(state, 'auto_battle_2')).toBe('available');
  });

  it('libera baús e slots após Estatísticas (raiz)', () => {
    const roster = progressionReadyState().roster.map((hero, index) =>
      index === 0 ? hero.gainExperience(200) : hero,
    );
    const state = progressionReadyState()
      .withRoster(roster)
      .withUpgradeLevels({ battle_stats: 1 });

    expect(state.roster[0].level).toBeGreaterThanOrEqual(3);
    expect(nodeStatus(state, 'open_all_chests_1')).toBe('available');
    expect(nodeStatus(state, 'auto_open_chests_1')).toBeUndefined();
    expect(nodeStatus(state, 'battle_skill_slot_2')).toBe('available');
  });

  it('bloqueia slot de skill sem a raiz Estatísticas', () => {
    const state = progressionReadyState().withUpgradeLevels({ auto_battle: 2 });

    expect(nodeStatus(state, 'battle_skill_slot_2')).toBe('locked');
  });

  describe('overrides do Balance Lab', () => {
    afterEach(() => {
      setRuntimeUpgradeOverrides(null);
    });

    it('buildTree usa o custo com override, não o do catálogo', () => {
      const baseline = getCatalogUpgradeById('battle_stats_1')!;
      const overriddenCost = baseline.cost + 777;
      setRuntimeUpgradeOverrides({
        version: 1,
        updatedAt: null,
        upgrades: { battle_stats_1: { cost: overriddenCost } },
      });

      const node = new UpgradeService()
        .buildTree(progressionReadyState())
        .find((entry) => entry.definition.id === 'battle_stats_1');

      expect(node?.definition.cost).toBe(overriddenCost);
    });

    it('custo exibido na árvore casa com o cobrado na compra', () => {
      setRuntimeUpgradeOverrides({
        version: 1,
        updatedAt: null,
        upgrades: { battle_stats_1: { cost: 20 } },
      });

      const state = progressionReadyState();
      const shown = new UpgradeService()
        .buildTree(state)
        .find((entry) => entry.definition.id === 'battle_stats_1')!.definition.cost;
      const spent = state.gold.value() - service.purchase(state, 'battle_stats_1').gold.value();

      expect(shown).toBe(20);
      expect(spent).toBe(shown);
    });
  });
});
