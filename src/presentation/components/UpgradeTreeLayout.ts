export interface UpgradeNodePosition {
  x: number;
  y: number;
}

export type UpgradeTreeLayoutMap = Record<string, UpgradeNodePosition>;

/**
 * Layout orgânico da árvore única — ramos se espalham para cima, baixo e lados
 * a partir do núcleo de combate (auto_battle_2), no estilo da árvore de skills do TBH.
 */
export const UPGRADE_TREE_UNIFIED_LAYOUT: UpgradeTreeLayoutMap = {
  log_filter_1: { x: 500, y: 56 },

  shop_refresh_3: { x: 200, y: 160 },
  shop_refresh_2: { x: 200, y: 280 },
  shop_refresh_1: { x: 200, y: 400 },

  auto_open_chests_1: { x: 680, y: 140 },
  open_all_chests_1: { x: 810, y: 140 },
  open_all_chests_2: { x: 940, y: 140 },

  background_tick_2: { x: 96, y: 300 },
  background_tick_1: { x: 96, y: 420 },

  item_stash_1: { x: 680, y: 280 },
  item_stash_2: { x: 810, y: 280 },
  item_stash_3: { x: 940, y: 280 },

  divine_forge_1: { x: 540, y: 400 },
  auto_equip_loot_1: { x: 810, y: 400 },
  auto_equip_loot_2: { x: 940, y: 400 },

  hero_unlock_paladin: { x: 670, y: 400 },

  auto_battle_2: { x: 280, y: 520 },
  auto_battle_3: { x: 410, y: 520 },
  hero_unlock_berserker: { x: 540, y: 520 },

  battle_skill_slot_2: { x: 96, y: 640 },
  battle_skill_slot_3: { x: 96, y: 760 },

  optimize_loadout_1: { x: 410, y: 640 },
  optimize_loadout_2: { x: 540, y: 640 },
};

export const UPGRADE_TREE_VIEWBOX = { width: 1040, height: 820 };

/** Distância mínima entre centros de nodos (nodo = 52px). */
export const UPGRADE_TREE_MIN_NODE_DISTANCE = 76;

export function getUpgradeNodePosition(upgradeId: string): UpgradeNodePosition | null {
  return UPGRADE_TREE_UNIFIED_LAYOUT[upgradeId] ?? null;
}

export function listUpgradeLayoutEntries(): Array<{ id: string; x: number; y: number }> {
  return Object.entries(UPGRADE_TREE_UNIFIED_LAYOUT).map(([id, position]) => ({
    id,
    x: position.x,
    y: position.y,
  }));
}
