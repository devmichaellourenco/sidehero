import { GameState } from '../../domain/entities/GameState';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import {
  migrateChest,
  migrateEnemy,
  migrateGear,
  migrateHero,
} from './GameStateMigration';

const STORAGE_KEY = 'taskbar_hero_game_state';

export class ChromeStorageGameRepository implements IGameStateRepository {
  async load(): Promise<GameState> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const raw = result[STORAGE_KEY];

    if (!raw || typeof raw !== 'object') {
      const initial = GameState.initial();
      await this.save(initial);
      return initial;
    }

    try {
      return this.deserialize(raw);
    } catch {
      const initial = GameState.initial();
      await this.save(initial);
      return initial;
    }
  }

  async save(state: GameState): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: this.serialize(state) });
  }

  private serialize(state: GameState): Record<string, unknown> {
    const props = state.toProps();
    return {
      heroes: props.heroes.map((h) => {
        const heroProps = h.toProps();
        const equipment = heroProps.equipment ?? {};
        return {
          id: heroProps.id,
          name: heroProps.name,
          heroClass: heroProps.heroClass,
          baseAttack: heroProps.baseAttack,
          baseDefense: heroProps.baseDefense,
          baseMaxHealth: heroProps.baseMaxHealth,
          currentHealth: heroProps.currentHealth,
          experience: {
            current: heroProps.experience.current,
            toNextLevel: heroProps.experience.toNextLevel,
            level: heroProps.experience.level,
          },
          equipment: Object.fromEntries(
            Object.entries(equipment).map(([slot, gear]) => [
              slot,
              gear ? gear.toProps() : null,
            ]),
          ),
        };
      }),
      currentEnemy: props.currentEnemy?.toProps() ?? null,
      stage: props.stage,
      gold: props.gold,
      chests: props.chests.map((c) => c.toProps()),
      inventory: props.inventory.map((g) => g.toProps()),
      battleLog: props.battleLog,
      totalBattlesWon: props.totalBattlesWon,
      lastTickAt: props.lastTickAt,
      shopRefreshSeed: props.shopRefreshSeed,
    };
  }

  private deserialize(raw: Record<string, unknown>): GameState {
    const heroesRaw = Array.isArray(raw.heroes) ? raw.heroes : [];

    if (heroesRaw.length === 0) {
      throw new Error('Estado sem heróis');
    }

    return GameState.restore({
      heroes: heroesRaw.map((hero) => migrateHero(hero)),
      currentEnemy: migrateEnemy(raw.currentEnemy),
      stage: typeof raw.stage === 'number' ? raw.stage : 1,
      gold: typeof raw.gold === 'number' ? raw.gold : 0,
      chests: Array.isArray(raw.chests) ? raw.chests.map((c) => migrateChest(c)) : [],
      inventory: Array.isArray(raw.inventory) ? raw.inventory.map((g) => migrateGear(g)) : [],
      battleLog: Array.isArray(raw.battleLog)
        ? (raw.battleLog as { message: string; timestamp: number }[])
        : [],
      totalBattlesWon: typeof raw.totalBattlesWon === 'number' ? raw.totalBattlesWon : 0,
      lastTickAt: typeof raw.lastTickAt === 'number' ? raw.lastTickAt : Date.now(),
      shopRefreshSeed: typeof raw.shopRefreshSeed === 'number' ? raw.shopRefreshSeed : 0,
    });
  }
}
