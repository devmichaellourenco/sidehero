import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PhaseRun } from '../../domain/campaign/PhaseRun';
import { GameState } from '../../domain/entities/GameState';
import { Gear } from '../../domain/entities/Gear';
import { INVENTORY_CAPACITY } from '../../domain/storage/StorageCapacityPolicy';
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
      roster: expect.any(Array),
      loadoutEditOpen: true,
      phaseRestartOnResume: true,
    });
    expect(storage[STORAGE_KEY]).not.toHaveProperty('heroes');

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

  it('carrega saves antigos que só tinham heroes', async () => {
    const repository = new ChromeStorageGameRepository();
    const paused = GameState.initial().withPhaseRun(PhaseRun.start('3-4'));

    await repository.save(paused);
    const saved = storage[STORAGE_KEY] as Record<string, unknown>;
    storage[STORAGE_KEY] = {
      ...saved,
      heroes: saved.roster,
      roster: undefined,
    };

    const loaded = await repository.load();
    expect(loaded.phaseRun?.phaseId).toBe('3-4');
    expect(loaded.roster.length).toBeGreaterThan(0);
  });

  it('converte excesso de inventário legado em baús com loot garantido', async () => {
    const repository = new ChromeStorageGameRepository();
    const inventory = Array.from({ length: INVENTORY_CAPACITY + 2 }, (_, index) =>
      Gear.create({
        id: `legacy-${index}`,
        name: `Item ${index}`,
        templateId: 'equip_axe_1',
        slot: 'weapon',
        rarity: 'common',
        attackBonus: 1,
        defenseBonus: 0,
        healthBonus: 0,
      }),
    );

    await repository.save(GameState.initial().withInventory(inventory));
    const loaded = await repository.load();

    expect(loaded.inventory).toHaveLength(INVENTORY_CAPACITY);
    expect(loaded.chests).toHaveLength(2);
    expect(loaded.chests.map((chest) => chest.guaranteedLoot?.id)).toEqual([
      'legacy-30',
      'legacy-31',
    ]);
  });
});
