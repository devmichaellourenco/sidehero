import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PhaseRun } from '../../domain/campaign/PhaseRun';
import { GameState } from '../../domain/entities/GameState';
import { ChromeStorageGameRepository } from './ChromeStorageGameRepository';

const STORAGE_KEY = 'taskbar_hero_game_state';

describe('ChromeStorageGameRepository', () => {
  let storage: Record<string, unknown>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: async (key: string) => ({ [key]: storage[key] }),
          set: async (value: Record<string, unknown>) => {
            Object.assign(storage, value);
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
});
