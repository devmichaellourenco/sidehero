import { describe, expect, it } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { RewardMomentDetector } from './RewardMomentDetector';

function baseState(overrides: Partial<GameStateDto> = {}): GameStateDto {
  return {
    heroes: [
      {
        id: 'hero-1',
        name: 'Galneon',
        heroClass: 'knight',
        emoji: '⚔️',
        level: 5,
        experience: 0,
        experienceToNextLevel: 100,
        attack: 10,
        defense: 5,
        attackSpeed: 1,
        castSpeed: 1,
        critChance: 0,
        critDamage: 1.5,
        health: 100,
        maxHealth: 100,
        baseAttributes: { str: 1, dex: 1, int: 1 },
        allocatedAttributes: { str: 0, dex: 0, int: 0 },
        totalAttributes: { str: 1, dex: 1, int: 1 },
        unspentImprovementPoints: 0,
        unspentAscensionPoints: 0,
        skillRanks: {},
        equippedSkillIds: [],
        activeSkills: [],
        maxActiveSkills: 1,
        unlockedActiveSkillSlots: 1,
        ascensionId: null,
        hasUnspentPoints: false,
        equipment: {},
        combatIntent: null,
        combatSkills: [],
        combatSkillCooldowns: [],
        statusEffects: [],
        combatResists: { fire: 0, cold: 0, lightning: 0, chaos: 0 },
      },
    ],
    enemies: [],
    stage: 1,
    difficultyTier: 1,
    gold: 100,
    chests: [],
    inventory: [],
    stash: [],
    storageCapacity: {
      inventoryLimit: 30,
      inventoryUsed: 0,
      stashLimit: 0,
      stashUsed: 0,
      stashUnlocked: false,
    },
    battleLog: [],
    totalBattlesWon: 0,
    pendingChestCount: 0,
    upgradeLevels: {},
    shopRefreshUses: 0,
    shopRefreshLimit: 0,
    purchasableUpgradeCount: 0,
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
      itemStash: false,
      stashCapacity: 0,
      inventoryCapacity: 30,
      divineForge: false,
    },
    chestProgress: { current: 0, target: 5, ratio: 0 },
    gearUpgradeHints: [],
    campaignProgress: {
      selectedPhaseId: '1-1',
      unlockedPhaseIds: ['1-1'],
      clearedPhaseIds: [],
      highestTierReached: 1,
      seasonCompleted: false,
    },
    seasonCompleted: false,
    canEditParty: true,
    phaseRun: null,
    combatIntermission: null,
    activeTurn: null,
    ...overrides,
  } as GameStateDto;
}

describe('RewardMomentDetector', () => {
  const detector = new RewardMomentDetector();

  it('detecta baú disponível como celebração', () => {
    const previous = baseState({ pendingChestCount: 0, chests: [] });
    const next = baseState({
      pendingChestCount: 1,
      chests: [
        {
          id: 'chest-1',
          stageEarned: 1,
          chestType: 'battle',
          chestLabel: 'Baú de Batalha',
          opened: false,
        },
      ],
    });

    const moments = detector.detect(previous, next);
    expect(moments.some((moment) => moment.kind === 'chest_available')).toBe(true);
  });

  it('agrupa múltiplos level-ups em um card', () => {
    const previous = baseState({
      heroes: [
        {
          ...baseState().heroes[0],
          id: 'hero-1',
          name: 'Galneon',
          level: 4,
        },
        {
          ...baseState().heroes[0],
          id: 'hero-2',
          name: 'Nix',
          emoji: '🔮',
          level: 3,
        },
      ],
    });
    const next = baseState({
      heroes: [
        { ...previous.heroes[0], level: 5 },
        { ...previous.heroes[1], level: 4 },
      ],
    });

    const moments = detector.detect(previous, next);
    const levelMoments = moments.filter((moment) => moment.kind === 'level_up');
    expect(levelMoments).toHaveLength(1);
    expect(levelMoments[0].title).toContain('2 heróis');
  });

  it('ignora recompensas de vitória quando skipVictoryRewards', () => {
    const previous = baseState({ stage: 1 });
    const next = baseState({ stage: 2 });

    const moments = detector.detect(previous, next, {}, { skipVictoryRewards: true });
    expect(moments).toHaveLength(0);
  });

  it('só celebra loot raro ou melhor', () => {
    expect(
      detector.buildLootMoment({
        id: 'g1',
        name: 'Espada',
        templateId: 'sword',
        slot: 'weapon',
        rarity: 'common',
        attackBonus: 1,
        defenseBonus: 0,
        healthBonus: 0,
        attackSpeedBonus: 0,
        castSpeedBonus: 0,
        critChanceBonus: 0,
        critDamageBonus: 0,
        fireResistBonus: 0,
        coldResistBonus: 0,
        lightningResistBonus: 0,
        chaosResistBonus: 0,
        allElementalResistBonus: 0,
        dodgeChanceBonus: 0,
        blockChanceBonus: 0,
        damageReductionBonus: 0,
        requirements: { minLevel: 1 },
      }),
    ).toBeNull();

    expect(
      detector.buildLootMoment({
        id: 'g2',
        name: 'Espada Rara',
        templateId: 'sword',
        slot: 'weapon',
        rarity: 'rare',
        attackBonus: 1,
        defenseBonus: 0,
        healthBonus: 0,
        attackSpeedBonus: 0,
        castSpeedBonus: 0,
        critChanceBonus: 0,
        critDamageBonus: 0,
        fireResistBonus: 0,
        coldResistBonus: 0,
        lightningResistBonus: 0,
        chaosResistBonus: 0,
        allElementalResistBonus: 0,
        dodgeChanceBonus: 0,
        blockChanceBonus: 0,
        damageReductionBonus: 0,
        requirements: { minLevel: 1 },
      })?.kind,
    ).toBe('loot_received');
  });
});
