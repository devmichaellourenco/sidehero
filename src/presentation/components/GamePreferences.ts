export interface GamePreferences {
  autoBattle: boolean;
  autoOpenChests: boolean;
  autoEquipLoot: boolean;
  autoBattleSpeed: 1 | 2;
  logFilterImportant: boolean;
}

const STORAGE_KEYS = {
  autoBattle: 'sidehero_auto_battle',
  autoOpenChests: 'sidehero_auto_open_chest',
  autoEquipLoot: 'sidehero_auto_equip_loot',
  autoBattleSpeed: 'sidehero_auto_battle_speed',
  logFilterImportant: 'sidehero_log_filter_important',
} as const;

const DEFAULT_PREFERENCES: GamePreferences = {
  autoBattle: false,
  autoOpenChests: false,
  autoEquipLoot: false,
  autoBattleSpeed: 1,
  logFilterImportant: false,
};

function readFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeFlag(key: string, enabled: boolean): void {
  try {
    sessionStorage.setItem(key, enabled ? '1' : '0');
  } catch {
    // sessionStorage indisponível
  }
}

export function loadGamePreferences(): GamePreferences {
  try {
    const speedRaw = sessionStorage.getItem(STORAGE_KEYS.autoBattleSpeed);
    return {
      autoBattle: readFlag(STORAGE_KEYS.autoBattle),
      autoOpenChests: readFlag(STORAGE_KEYS.autoOpenChests),
      autoEquipLoot: readFlag(STORAGE_KEYS.autoEquipLoot),
      autoBattleSpeed: speedRaw === '2' ? 2 : 1,
      logFilterImportant: readFlag(STORAGE_KEYS.logFilterImportant),
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function saveGamePreferences(preferences: GamePreferences): void {
  writeFlag(STORAGE_KEYS.autoBattle, preferences.autoBattle);
  writeFlag(STORAGE_KEYS.autoOpenChests, preferences.autoOpenChests);
  writeFlag(STORAGE_KEYS.autoEquipLoot, preferences.autoEquipLoot);
  writeFlag(STORAGE_KEYS.logFilterImportant, preferences.logFilterImportant);

  try {
    sessionStorage.setItem(STORAGE_KEYS.autoBattleSpeed, String(preferences.autoBattleSpeed));
  } catch {
    // sessionStorage indisponível
  }
}

export function updateGamePreference<K extends keyof GamePreferences>(
  key: K,
  value: GamePreferences[K],
): GamePreferences {
  const next = { ...loadGamePreferences(), [key]: value };
  saveGamePreferences(next);
  return next;
}
