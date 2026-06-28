import { UpgradeBranchDto } from '../../application/dto/UpgradeBranchDto';

export interface UpgradeNodePosition {
  x: number;
  y: number;
}

export type UpgradeTreeLayoutMap = Record<string, UpgradeNodePosition>;

const COMBAT_LAYOUT: UpgradeTreeLayoutMap = {
  background_tick_1: { x: 48, y: 36 },
  background_tick_2: { x: 168, y: 36 },
  auto_battle_2: { x: 48, y: 108 },
  auto_battle_3: { x: 168, y: 108 },
  battle_skill_slot_2: { x: 48, y: 180 },
  battle_skill_slot_3: { x: 168, y: 180 },
};

const CHESTS_LAYOUT: UpgradeTreeLayoutMap = {
  auto_open_chests_1: { x: 56, y: 88 },
  open_all_chests_1: { x: 156, y: 88 },
  open_all_chests_2: { x: 256, y: 88 },
};

const EQUIPMENT_LAYOUT: UpgradeTreeLayoutMap = {
  item_stash_1: { x: 40, y: 40 },
  item_stash_2: { x: 140, y: 40 },
  item_stash_3: { x: 240, y: 40 },
  optimize_loadout_1: { x: 40, y: 112 },
  optimize_loadout_2: { x: 140, y: 112 },
  divine_forge_1: { x: 240, y: 112 },
  auto_equip_loot_1: { x: 90, y: 184 },
  auto_equip_loot_2: { x: 190, y: 184 },
};

const QOL_LAYOUT: UpgradeTreeLayoutMap = {
  log_filter_1: { x: 150, y: 96 },
};

const ECONOMY_LAYOUT: UpgradeTreeLayoutMap = {
  shop_refresh_1: { x: 56, y: 88 },
  shop_refresh_2: { x: 156, y: 88 },
  shop_refresh_3: { x: 256, y: 88 },
};

const HEROES_LAYOUT: UpgradeTreeLayoutMap = {
  hero_unlock_berserker: { x: 88, y: 96 },
  hero_unlock_paladin: { x: 212, y: 96 },
};

export const UPGRADE_TREE_LAYOUTS: Record<UpgradeBranchDto, UpgradeTreeLayoutMap> = {
  combat: COMBAT_LAYOUT,
  chests: CHESTS_LAYOUT,
  equipment: EQUIPMENT_LAYOUT,
  qol: QOL_LAYOUT,
  economy: ECONOMY_LAYOUT,
  heroes: HEROES_LAYOUT,
};

export const UPGRADE_TREE_VIEWBOX: Record<UpgradeBranchDto, { width: number; height: number }> = {
  combat: { width: 280, height: 220 },
  chests: { width: 320, height: 180 },
  equipment: { width: 300, height: 240 },
  qol: { width: 300, height: 180 },
  economy: { width: 320, height: 180 },
  heroes: { width: 300, height: 180 },
};

export function getUpgradeNodePosition(branch: UpgradeBranchDto, upgradeId: string): UpgradeNodePosition | null {
  return UPGRADE_TREE_LAYOUTS[branch][upgradeId] ?? null;
}
