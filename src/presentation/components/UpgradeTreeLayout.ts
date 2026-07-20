export interface UpgradeNodePosition {
  x: number;
  y: number;
}

export type UpgradeTreeLayoutMap = Record<string, UpgradeNodePosition>;

/**
 * Layout em ramos retos: raiz única `optimize_loadout_1` no centro.
 */
export const UPGRADE_TREE_UNIFIED_LAYOUT: UpgradeTreeLayoutMap = {
  optimize_loadout_1: { x: 500, y: 400 },

  battle_stats_1: { x: 380, y: 400 },
  auto_battle_2: { x: 260, y: 400 },
  auto_battle_3: { x: 140, y: 400 },
  log_filter_1: { x: 20, y: 400 },

  background_tick_1: { x: 140, y: 280 },
  background_tick_2: { x: 140, y: 160 },

  shop_refresh_1: { x: 260, y: 280 },
  shop_refresh_2: { x: 260, y: 160 },
  shop_refresh_3: { x: 260, y: 40 },

  hero_unlock_berserker: { x: 140, y: 520 },
  hero_unlock_paladin: { x: 20, y: 520 },

  auto_open_chests_1: { x: 620, y: 400 },
  open_all_chests_1: { x: 740, y: 400 },
  open_all_chests_2: { x: 860, y: 400 },

  item_stash_1: { x: 620, y: 280 },
  item_stash_2: { x: 740, y: 280 },
  item_stash_3: { x: 860, y: 280 },

  divine_forge_1: { x: 500, y: 280 },
  improvement_reset_1: { x: 500, y: 160 },
  improvement_reset_2: { x: 500, y: 40 },

  optimize_loadout_2: { x: 380, y: 520 },
  auto_equip_loot_1: { x: 620, y: 520 },
  auto_equip_loot_2: { x: 860, y: 520 },

  battle_skill_slot_2: { x: 500, y: 520 },
  battle_skill_slot_3: { x: 500, y: 640 },
};

export const UPGRADE_TREE_VIEWBOX = { width: 1180, height: 700 };

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
