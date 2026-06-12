import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PhaseRun } from '../../domain/campaign/PhaseRun';
import { GameState } from '../../domain/entities/GameState';
import { ChromeStorageGameRepository } from './ChromeStorageGameRepository';

const STORAGE_KEY = 'side_hero_game_state';
const LEGACY_STORAGE_KEY = 'taskbar_hero_game_state';

describe('ChromeStorageGameRepository', () => {
  let storage: Record<string, unknown>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: async (keys: string | string[]) => {
            const keyList = Array.isArray(keys) ? keys : [keys];
            return Object.fromEntries(keyList.map((key) => [key, storage[key]]));
          },
          set: async (value: Record<string, unknown>) => {
            Object.assign(storage, value);
          },
          remove: async (keys: string | string[]) => {
            const keyList = Array.isArray(keys) ? keys : [keys];
            for (const key of keyList) {
              delete storage[key];
            }
          },
        },
      },
    });
  });

  it('persiste loadoutEditOpen e phaseRestartOnResume no roundtrip', async () => {
    const repository = new ChromeStorageGameRepository();
    const paused = GameState.initial()
      .withPhaseRun(PhaseRun.start('1-1'))
      .withCombat(null)
      .withLoadoutEditOpen(true)
      .withPhaseRestartOnResume(true);

    await repository.save(paused);
    expect(storage[STORAGE_KEY]).toMatchObject({
      loadoutEditOpen: true,
      phaseRestartOnResume: true,
    });

    const loaded = await repository.load();
    expect(loaded.loadoutEditOpen).toBe(true);
    expect(loaded.phaseRestartOnResume).toBe(true);
    expect(loaded.phaseRun?.phaseId).toBe('1-1');
  });

  it('migra save legado taskbar_hero_game_state para side_hero_game_state', async () => {
    const repository = new ChromeStorageGameRepository();
    const paused = GameState.initial().withPhaseRun(PhaseRun.start('2-3'));

    await repository.save(paused);
    storage[LEGACY_STORAGE_KEY] = storage[STORAGE_KEY];
    delete storage[STORAGE_KEY];

    const loaded = await repository.load();
    expect(loaded.phaseRun?.phaseId).toBe('2-3');
    expect(storage[STORAGE_KEY]).toBeDefined();
    expect(storage[LEGACY_STORAGE_KEY]).toBeUndefined();
  });
});
