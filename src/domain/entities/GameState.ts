import { Gold } from '../value-objects/Gold';
import { Chest } from './Chest';
import { Enemy } from './Enemy';
import { Gear } from './Gear';
import { Hero } from './Hero';

export interface BattleLogEntry {
  message: string;
  timestamp: number;
}

export interface GameStateProps {
  heroes: Hero[];
  currentEnemy: Enemy | null;
  stage: number;
  gold: number;
  chests: Chest[];
  inventory: Gear[];
  battleLog: BattleLogEntry[];
  totalBattlesWon: number;
  lastTickAt: number;
  shopRefreshSeed: number;
}

export class GameState {
  readonly heroes: Hero[];
  readonly currentEnemy: Enemy | null;
  readonly stage: number;
  readonly gold: Gold;
  readonly chests: Chest[];
  readonly inventory: Gear[];
  readonly battleLog: BattleLogEntry[];
  readonly totalBattlesWon: number;
  readonly lastTickAt: number;
  readonly shopRefreshSeed: number;

  private constructor(props: GameStateProps) {
    this.heroes = props.heroes;
    this.currentEnemy = props.currentEnemy;
    this.stage = props.stage;
    this.gold = Gold.of(props.gold);
    this.chests = props.chests;
    this.inventory = props.inventory;
    this.battleLog = props.battleLog.slice(-20);
    this.totalBattlesWon = props.totalBattlesWon;
    this.lastTickAt = props.lastTickAt;
    this.shopRefreshSeed = Math.max(0, props.shopRefreshSeed ?? 0);
  }

  static initial(): GameState {
    const heroes = [
      Hero.createStarter('hero-1', 'knight', 'Arthos'),
      Hero.createStarter('hero-2', 'sorcerer', 'Lyra'),
      Hero.createStarter('hero-3', 'priest', 'Elara'),
    ];

    return new GameState({
      heroes,
      currentEnemy: Enemy.forStage(1),
      stage: 1,
      gold: 0,
      chests: [],
      inventory: [],
      battleLog: [{ message: 'A aventura começou no Side Hero!', timestamp: Date.now() }],
      totalBattlesWon: 0,
      lastTickAt: Date.now(),
      shopRefreshSeed: 0,
    });
  }

  static restore(props: GameStateProps): GameState {
    return new GameState(props);
  }

  withEnemy(enemy: Enemy | null): GameState {
    return this.clone({ currentEnemy: enemy });
  }

  withHeroes(heroes: Hero[]): GameState {
    return this.clone({ heroes });
  }

  withGold(gold: Gold): GameState {
    return this.clone({ gold: gold.value() });
  }

  withStage(stage: number): GameState {
    return this.clone({ stage, shopRefreshSeed: 0 });
  }

  withShopRefreshSeed(shopRefreshSeed: number): GameState {
    return this.clone({ shopRefreshSeed: Math.max(0, shopRefreshSeed) });
  }

  withChests(chests: Chest[]): GameState {
    return this.clone({ chests });
  }

  withInventory(inventory: Gear[]): GameState {
    return this.clone({ inventory });
  }

  addLog(message: string): GameState {
    const entry = { message, timestamp: Date.now() };
    return this.clone({ battleLog: [...this.battleLog, entry] });
  }

  incrementBattlesWon(): GameState {
    return this.clone({ totalBattlesWon: this.totalBattlesWon + 1 });
  }

  touchTick(): GameState {
    return this.clone({ lastTickAt: Date.now() });
  }

  pendingChests(): Chest[] {
    return this.chests.filter((c) => !c.opened);
  }

  toProps(): GameStateProps {
    return {
      heroes: this.heroes,
      currentEnemy: this.currentEnemy,
      stage: this.stage,
      gold: this.gold.value(),
      chests: this.chests,
      inventory: this.inventory,
      battleLog: this.battleLog,
      totalBattlesWon: this.totalBattlesWon,
      lastTickAt: this.lastTickAt,
      shopRefreshSeed: this.shopRefreshSeed,
    };
  }

  private clone(partial: Partial<GameStateProps>): GameState {
    return new GameState({ ...this.toProps(), ...partial });
  }
}
