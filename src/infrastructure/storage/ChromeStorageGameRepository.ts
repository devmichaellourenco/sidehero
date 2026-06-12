import { CampaignProgressProps } from '../../domain/campaign/CampaignProgress';
import { Hero } from '../../domain/entities/Hero';
import { GameState } from '../../domain/entities/GameState';
import {
  getUnlockedBattleSkillSlotCount,
  trimEquippedSkillIds,
} from '../../domain/progression/SkillBattleSlots';
import { UpgradeLevels } from '../../domain/upgrades/FeatureKey';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import {
  migrateChest,
  migrateCombat,
  migrateEnemy,
  migrateGear,
  migrateHero,
} from './GameStateMigration';

const STORAGE_KEY = 'side_hero_game_state';
const LEGACY_STORAGE_KEY = 'taskbar_hero_game_state';

function serializeHero(hero: Hero): Record<string, unknown> {
  const heroProps = hero.toProps();
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
      Object.entries(equipment).map(([slot, gear]) => [slot, gear ? gear.toProps() : null]),
    ),
    allocatedAttributes: heroProps.allocatedAttributes,
    unspentImprovementPoints: heroProps.unspentImprovementPoints,
    unspentAscensionPoints: heroProps.unspentAscensionPoints,
    skillRanks: heroProps.skillRanks,
    equippedSkillIds: heroProps.equippedSkillIds,
    ascensionId: heroProps.ascensionId,
  };
}

export class ChromeStorageGameRepository implements IGameStateRepository {
  async load(): Promise<GameState> {
    const result = await chrome.storage.local.get([STORAGE_KEY, LEGACY_STORAGE_KEY]);
    const raw = result[STORAGE_KEY] ?? result[LEGACY_STORAGE_KEY];

    if (!raw || typeof raw !== 'object') {
      const initial = GameState.initial();
      await this.save(initial);
      return initial;
    }

    try {
      const state = this.deserialize(raw);
      if (!result[STORAGE_KEY] && result[LEGACY_STORAGE_KEY]) {
        await this.save(state);
        await chrome.storage.local.remove(LEGACY_STORAGE_KEY);
      }
      return state;
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
    const roster = props.roster ?? props.heroes ?? [];
    const serializedHeroes = roster.map((hero) => serializeHero(hero));

    return {
      heroes: serializedHeroes,
      roster: serializedHeroes,
      activePartyIds: [...props.activePartyIds ?? []],
      combat: props.combat?.toProps() ?? null,
      campaignProgress: props.campaignProgress,
      phaseRun: props.phaseRun,
      stage: props.stage,
      gold: props.gold,
      chests: props.chests.map((c) => c.toProps()),
      inventory: props.inventory.map((g) => g.toProps()),
      battleLog: props.battleLog,
      totalBattlesWon: props.totalBattlesWon,
      lastTickAt: props.lastTickAt,
      shopRefreshSeed: props.shopRefreshSeed,
      upgradeLevels: props.upgradeLevels,
      shopRefreshUses: props.shopRefreshUses,
      loadoutEditOpen: props.loadoutEditOpen && props.phaseRestartOnResume,
      phaseRestartOnResume: props.phaseRestartOnResume,
    };
  }

  private deserialize(raw: Record<string, unknown>): GameState {
    const rosterRaw = Array.isArray(raw.roster)
      ? raw.roster
      : Array.isArray(raw.heroes)
        ? raw.heroes
        : [];

    if (rosterRaw.length === 0) {
      throw new Error('Estado sem heróis');
    }

    const roster = rosterRaw.map((hero) => migrateHero(hero));
    const activePartyIds = Array.isArray(raw.activePartyIds)
      ? raw.activePartyIds.filter((id): id is string => typeof id === 'string')
      : undefined;
    const legacyEnemy = migrateEnemy(raw.currentEnemy);

    const upgradeLevels =
      raw.upgradeLevels && typeof raw.upgradeLevels === 'object'
        ? (raw.upgradeLevels as UpgradeLevels)
        : {};

    const normalizedRoster = normalizeHeroEquippedSkills(roster, upgradeLevels);

    return GameState.restore({
      roster: normalizedRoster,
      heroes: normalizedRoster,
      activePartyIds,
      combat: migrateCombat(raw.combat, normalizedRoster, legacyEnemy),
      campaignProgress:
        raw.campaignProgress && typeof raw.campaignProgress === 'object'
          ? (raw.campaignProgress as CampaignProgressProps)
          : undefined,
      phaseRun:
        raw.phaseRun && typeof raw.phaseRun === 'object'
          ? (raw.phaseRun as { phaseId: string; waveIndex: number })
          : null,
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
      upgradeLevels,
      shopRefreshUses: typeof raw.shopRefreshUses === 'number' ? raw.shopRefreshUses : 0,
      phaseRestartOnResume: raw.phaseRestartOnResume === true,
      loadoutEditOpen:
        raw.loadoutEditOpen === true && raw.phaseRestartOnResume === true,
    });
  }
}

function normalizeHeroEquippedSkills(heroes: Hero[], upgradeLevels: UpgradeLevels): Hero[] {
  const unlockedSlots = getUnlockedBattleSkillSlotCount(upgradeLevels);

  return heroes.map((hero) => {
    const props = hero.toProps();
    const trimmed = trimEquippedSkillIds(props.equippedSkillIds, unlockedSlots);
    const unchanged =
      trimmed.length === props.equippedSkillIds.length &&
      trimmed.every((id, index) => id === props.equippedSkillIds[index]);

    if (unchanged) return hero;

    return Hero.restore({
      ...props,
      equippedSkillIds: trimmed,
    });
  });
}
