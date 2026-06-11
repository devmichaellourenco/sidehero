import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { GamePreferencesController } from './GamePreferencesController';

const sessionStore = new Map<string, string>();

vi.stubGlobal('sessionStorage', {
  getItem: (key: string) => sessionStore.get(key) ?? null,
  setItem: (key: string, value: string) => {
    sessionStore.set(key, value);
  },
  removeItem: (key: string) => {
    sessionStore.delete(key);
  },
  clear: () => {
    sessionStore.clear();
  },
});

function createStateWithAutoBattle(): GameStateDto {
  return {
    stage: 1,
    gold: 0,
    heroes: [],
    inventory: [],
    chests: [],
    pendingChestCount: 0,
    battleLog: [],
    currentEnemy: null,
    upgradeLevels: {},
    shopRefreshLimit: 0,
    shopRefreshUses: 0,
    featureFlags: {
      autoBattle: true,
      autoBattleMaxSpeed: 1,
      autoOpenChests: false,
      openAllChests: false,
      autoOpenAllChests: false,
      optimizeLoadout: false,
      optimizeInLootBatch: false,
      autoEquipLoot: false,
      autoEquipSilent: false,
      logFilter: false,
      shopRefresh: false,
      backgroundTick: false,
      backgroundTickMultiplier: 1,
    },
  } as GameStateDto;
}

describe('GamePreferencesController', () => {
  beforeEach(() => {
    sessionStore.clear();
  });

  it('liga auto-batalha por padrão em sessão nova', () => {
    const controller = new GamePreferencesController();
    const state = createStateWithAutoBattle();

    controller.apply(state);

    expect(controller.preferences.autoBattle).toBe(true);
    expect(controller.autoBattleEnabled).toBe(true);
  });

  it('persiste auto-batalha ao atualizar preferência', () => {
    const controller = new GamePreferencesController();
    const state = createStateWithAutoBattle();

    const result = controller.update('autoBattle', true, state);

    expect(result.applied).toBe(true);
    expect(controller.preferences.autoBattle).toBe(true);
    expect(controller.autoBattleEnabled).toBe(true);
  });
});
