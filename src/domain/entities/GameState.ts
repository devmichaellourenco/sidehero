import { Gold } from '../value-objects/Gold';
import { UpgradeLevels } from '../upgrades/FeatureKey';
import { CampaignProgress, CampaignProgressProps } from '../campaign/CampaignProgress';
import { PhaseRun, PhaseRunProps } from '../campaign/PhaseRun';
import { resolvePhase } from '../campaign/CampaignCatalog';
import { Chest } from './Chest';
import { CombatState } from './CombatState';
import { Enemy } from './Enemy';
import { Gear } from './Gear';
import { Hero } from './Hero';
import { TurnOrderService } from '../services/combat/TurnOrderService';
import { normalizePartyFromProps } from '../party/PartyNormalizer';

export interface BattleLogEntry {
  message: string;
  timestamp: number;
}

export interface GameStateProps {
  /** Legado — preferir `roster`. Mantido para saves antigos. */
  heroes?: Hero[];
  roster?: Hero[];
  activePartyIds?: string[];
  combat: CombatState | null;
  /** Legado — migrado para `combat` no load. */
  currentEnemy?: Enemy | null;
  campaignProgress: CampaignProgressProps;
  phaseRun: PhaseRunProps | null;
  /** Tier de dificuldade máximo alcançado (gates de loja/upgrades). */
  stage: number;
  gold: number;
  chests: Chest[];
  inventory: Gear[];
  battleLog: BattleLogEntry[];
  totalBattlesWon: number;
  lastTickAt: number;
  shopRefreshSeed: number;
  upgradeLevels: UpgradeLevels;
  shopRefreshUses: number;
}

export class GameState {
  readonly roster: Hero[];
  readonly activePartyIds: readonly string[];
  readonly combat: CombatState | null;
  readonly campaignProgress: CampaignProgress;
  readonly phaseRun: PhaseRun | null;
  readonly stage: number;
  readonly gold: Gold;
  readonly chests: Chest[];
  readonly inventory: Gear[];
  readonly battleLog: BattleLogEntry[];
  readonly totalBattlesWon: number;
  readonly lastTickAt: number;
  readonly shopRefreshSeed: number;
  readonly upgradeLevels: UpgradeLevels;
  readonly shopRefreshUses: number;

  private constructor(props: GameStateProps) {
    const legacyHeroes = props.heroes ?? [];
    const party = normalizePartyFromProps(legacyHeroes, props.roster, props.activePartyIds);
    this.roster = party.roster;
    this.activePartyIds = party.activePartyIds;
    this.combat = props.combat;
    this.campaignProgress = CampaignProgress.restore(props.campaignProgress);
    this.phaseRun = props.phaseRun ? PhaseRun.restore(props.phaseRun) : null;
    this.stage = props.stage;
    this.gold = Gold.of(props.gold);
    this.chests = props.chests;
    this.inventory = props.inventory;
    this.battleLog = props.battleLog.slice(-20);
    this.totalBattlesWon = props.totalBattlesWon;
    this.lastTickAt = props.lastTickAt;
    this.shopRefreshSeed = Math.max(0, props.shopRefreshSeed ?? 0);
    this.upgradeLevels = props.upgradeLevels ?? {};
    this.shopRefreshUses = Math.max(0, props.shopRefreshUses ?? 0);
  }

  static initial(): GameState {
    const heroes = [
      Hero.createStarter('hero-1', 'knight', 'Arthos'),
      Hero.createStarter('hero-2', 'sorcerer', 'Lyra'),
      Hero.createStarter('hero-3', 'priest', 'Elara'),
    ];
    const progress = CampaignProgress.initial();

    return new GameState({
      roster: heroes,
      activePartyIds: heroes.map((hero) => hero.id),
      combat: null,
      campaignProgress: progress.toProps(),
      phaseRun: null,
      stage: progress.highestTierReached,
      gold: 0,
      chests: [],
      inventory: [],
      battleLog: [{ message: 'A aventura começou no Side Hero!', timestamp: Date.now() }],
      totalBattlesWon: 0,
      lastTickAt: Date.now(),
      shopRefreshSeed: 0,
      upgradeLevels: {},
      shopRefreshUses: 0,
    });
  }

  static restore(props: GameStateProps): GameState {
    return new GameState({
      ...props,
      campaignProgress: props.campaignProgress ?? CampaignProgress.initial().toProps(),
      phaseRun: props.phaseRun ?? null,
    });
  }

  /** Alias legado de `roster`. */
  get heroes(): Hero[] {
    return this.roster;
  }

  activeHeroes(): Hero[] {
    return this.activePartyIds
      .map((id) => this.roster.find((hero) => hero.id === id))
      .filter((hero): hero is Hero => hero !== undefined);
  }

  benchHeroes(): Hero[] {
    const activeIds = new Set(this.activePartyIds);
    return this.roster.filter((hero) => !activeIds.has(hero.id));
  }

  get currentEnemy(): Enemy | null {
    return this.combat?.enemies[0] ?? null;
  }

  currentDifficultyTier(): number {
    const phaseId =
      this.combat?.encounterMeta?.phaseId ??
      this.phaseRun?.phaseId ??
      this.campaignProgress.selectedPhaseId;
    return resolvePhase(phaseId)?.difficultyTier ?? this.stage;
  }

  withCombat(combat: CombatState | null): GameState {
    return this.clone({ combat });
  }

  withEnemy(enemy: Enemy | null): GameState {
    if (!enemy) {
      return this.withCombat(null);
    }

    const turnOrder = new TurnOrderService();
    return this.withCombat(CombatState.fromLegacyEnemy(enemy, this.activeHeroes(), turnOrder));
  }

  withRoster(roster: Hero[]): GameState {
    return this.clone({ roster, heroes: roster });
  }

  withActivePartyIds(activePartyIds: string[]): GameState {
    return this.clone({ activePartyIds: [...activePartyIds] });
  }

  withRosterHeroes(updates: Hero[]): GameState {
    const byId = new Map(updates.map((hero) => [hero.id, hero]));
    const roster = this.roster.map((hero) => byId.get(hero.id) ?? hero);
    return this.withRoster(roster);
  }

  withHeroes(heroes: Hero[]): GameState {
    return this.withRosterHeroes(heroes);
  }

  withGold(gold: Gold): GameState {
    return this.clone({ gold: gold.value() });
  }

  withCampaignProgress(progress: CampaignProgress): GameState {
    return this.clone({ campaignProgress: progress.toProps() });
  }

  withPhaseRun(phaseRun: PhaseRun | null): GameState {
    return this.clone({ phaseRun: phaseRun?.toProps() ?? null });
  }

  withStage(stage: number): GameState {
    return this.clone({ stage, shopRefreshSeed: 0, shopRefreshUses: 0 });
  }

  withShopRefreshSeed(shopRefreshSeed: number): GameState {
    return this.clone({ shopRefreshSeed: Math.max(0, shopRefreshSeed) });
  }

  withShopRefreshUses(shopRefreshUses: number): GameState {
    return this.clone({ shopRefreshUses: Math.max(0, shopRefreshUses) });
  }

  withUpgradeLevels(upgradeLevels: UpgradeLevels): GameState {
    return this.clone({ upgradeLevels: { ...upgradeLevels } });
  }

  chestsOpenedCount(): number {
    return this.chests.filter((chest) => chest.opened).length;
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
      heroes: this.roster,
      roster: this.roster,
      activePartyIds: [...this.activePartyIds],
      combat: this.combat,
      campaignProgress: this.campaignProgress.toProps(),
      phaseRun: this.phaseRun?.toProps() ?? null,
      stage: this.stage,
      gold: this.gold.value(),
      chests: this.chests,
      inventory: this.inventory,
      battleLog: this.battleLog,
      totalBattlesWon: this.totalBattlesWon,
      lastTickAt: this.lastTickAt,
      shopRefreshSeed: this.shopRefreshSeed,
      upgradeLevels: this.upgradeLevels,
      shopRefreshUses: this.shopRefreshUses,
    };
  }

  private clone(partial: Partial<GameStateProps>): GameState {
    return new GameState({ ...this.toProps(), ...partial });
  }
}
