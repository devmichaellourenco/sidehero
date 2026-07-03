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
    expect(paladin?.parents).toEqual(['hero_unlock_berserker', 'optimize_loadout_1']);
    expect(paladin?.unlockHeroClass).toBe('paladin');
  });

  it('combate integra tick idle e slots de skill na árvore principal', () => {
    const tick = UPGRADE_CATALOG.find((entry) => entry.id === 'background_tick_1');
    const skillSlot = UPGRADE_CATALOG.find((entry) => entry.id === 'battle_skill_slot_2');

    expect(tick?.parents).toEqual(['auto_battle_2']);
    expect(skillSlot?.parents).toEqual(['auto_battle_2']);
  });

  it('economia integra renovar loja na árvore principal', () => {
    const shop = UPGRADE_CATALOG.find((entry) => entry.id === 'shop_refresh_1');

    expect(shop?.branch).toBe('economy');
    expect(shop?.parents).toEqual(['auto_battle_2']);
  });
});
