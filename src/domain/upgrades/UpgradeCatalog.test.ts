import { describe, expect, it } from 'vitest';
import { UPGRADE_TREE_UNIFIED_LAYOUT } from '../../presentation/components/UpgradeTreeLayout';
import { UPGRADE_CATALOG } from './UpgradeCatalog';

describe('UpgradeCatalog', () => {
  it('cada melhoria tem posição no layout unificado', () => {
    for (const entry of UPGRADE_CATALOG) {
      expect(UPGRADE_TREE_UNIFIED_LAYOUT[entry.id], `layout ausente: ${entry.id}`).toBeDefined();
    }
  });

  it('cada parent referencia outra melhoria do catálogo', () => {
    const ids = new Set(UPGRADE_CATALOG.map((entry) => entry.id));

    for (const entry of UPGRADE_CATALOG) {
      for (const parentId of entry.parents) {
        expect(ids.has(parentId), `parent inválido: ${entry.id} -> ${parentId}`).toBe(true);
      }
    }
  });

  it('não há ciclos na árvore de parents', () => {
    const byId = new Map(UPGRADE_CATALOG.map((entry) => [entry.id, entry.parents]));

    function hasCycle(startId: string): boolean {
      const visiting = new Set<string>();
      const visited = new Set<string>();

      function walk(id: string): boolean {
        if (visiting.has(id)) return true;
        if (visited.has(id)) return false;

        visiting.add(id);
        for (const parentId of byId.get(id) ?? []) {
          if (walk(parentId)) return true;
        }
        visiting.delete(id);
        visited.add(id);
        return false;
      }

      return walk(startId);
    }

    for (const entry of UPGRADE_CATALOG) {
      expect(hasCycle(entry.id), `ciclo detectado em ${entry.id}`).toBe(false);
    }
  });

  it('heróis estão na ramificação com parents corretos', () => {
    const berserker = UPGRADE_CATALOG.find((entry) => entry.id === 'hero_unlock_berserker');
    const paladin = UPGRADE_CATALOG.find((entry) => entry.id === 'hero_unlock_paladin');

    expect(berserker?.branch).toBe('heroes');
    expect(berserker?.parents).toEqual(['auto_battle_2']);
    expect(berserker?.unlockHeroClass).toBe('berserker');

    expect(paladin?.branch).toBe('heroes');
    expect(paladin?.parents).toEqual(['hero_unlock_berserker']);
    expect(paladin?.unlockHeroClass).toBe('paladin');
  });

  it('tem uma única raiz: Otimizar equipe I', () => {
    const roots = UPGRADE_CATALOG.filter((entry) => entry.parents.length === 0);
    expect(roots.map((entry) => entry.id)).toEqual(['optimize_loadout_1']);
  });

  it('combate integra tick idle e slots de skill a partir da raiz', () => {
    const tick = UPGRADE_CATALOG.find((entry) => entry.id === 'background_tick_1');
    const skillSlot = UPGRADE_CATALOG.find((entry) => entry.id === 'battle_skill_slot_2');
    const autoBattle = UPGRADE_CATALOG.find((entry) => entry.id === 'auto_battle_2');
    const autoChests = UPGRADE_CATALOG.find((entry) => entry.id === 'auto_open_chests_1');

    expect(autoBattle?.parents).toEqual(['optimize_loadout_1']);
    expect(autoChests?.parents).toEqual(['optimize_loadout_1']);
    expect(tick?.parents).toEqual(['auto_battle_2']);
    expect(skillSlot?.parents).toEqual(['optimize_loadout_1']);
  });

  it('economia integra renovar loja na árvore principal', () => {
    const shop = UPGRADE_CATALOG.find((entry) => entry.id === 'shop_refresh_1');

    expect(shop?.branch).toBe('economy');
    expect(shop?.parents).toEqual(['auto_battle_2']);
  });

  it('qol integra log resumido na árvore principal de combate', () => {
    const logFilter = UPGRADE_CATALOG.find((entry) => entry.id === 'log_filter_1');

    expect(logFilter?.branch).toBe('qol');
    expect(logFilter?.parents).toEqual(['auto_battle_3']);
  });

  it('reset de pontos I e II na árvore (Forja → I → II)', () => {
    const reset1 = UPGRADE_CATALOG.find((entry) => entry.id === 'improvement_reset_1');
    const reset2 = UPGRADE_CATALOG.find((entry) => entry.id === 'improvement_reset_2');

    expect(reset1?.feature).toBe('improvement_reset');
    expect(reset1?.level).toBe(1);
    expect(reset1?.cost).toBe(5000);
    expect(reset1?.parents).toEqual(['divine_forge_1']);
    expect(reset1?.requirements).toEqual(
      expect.arrayContaining([
        { type: 'upgrade_level', feature: 'divine_forge', minLevel: 1 },
        { type: 'min_hero_level', value: 12 },
      ]),
    );

    expect(reset2?.feature).toBe('improvement_reset');
    expect(reset2?.level).toBe(2);
    expect(reset2?.cost).toBe(10000);
    expect(reset2?.parents).toEqual(['improvement_reset_1']);
    expect(reset2?.requirements).toEqual(
      expect.arrayContaining([
        { type: 'upgrade_level', feature: 'improvement_reset', minLevel: 1 },
        { type: 'min_hero_level', value: 22 },
      ]),
    );
  });
});
