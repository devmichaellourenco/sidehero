import { describe, expect, it } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { detectBattleVictory } from './BattleVictoryDetector';

function baseState(partial: Partial<GameStateDto> = {}): GameStateDto {
  return {
    heroes: [],
    activeParty: [],
    activePartyIds: [],
    benchHeroes: [],
    canEditParty: true,
    enemies: [],
    enemy: null,
    activeTurn: null,
    combatRound: 1,
    campaignName: 'Temporada I',
    mapName: 'Estrenda',
    phaseLabel: 'Fase 1-2',
    phaseRun: null,
    campaignProgress: {
      selectedPhaseId: '1-2',
      unlockedPhaseIds: ['1-1', '1-2'],
      clearedPhaseIds: ['1-1'],
      highestTierReached: 1,
      seasonCompleted: false,
    },
    stage: 1,
    difficultyTier: 1,
    gold: 100,
    chests: [],
    inventory: [],
    battleLog: [],
    totalBattlesWon: 2,
    pendingChestCount: 0,
    upgradeLevels: {},
    shopRefreshUses: 0,
    shopRefreshLimit: 0,
    purchasableUpgradeCount: 0,
    featureFlags: {} as GameStateDto['featureFlags'],
    chestProgress: { wins: 2, target: 3, remaining: 1 },
    gearUpgradeHints: {},
    seasonCompleted: false,
    ...partial,
  };
}

describe('BattleVictoryDetector', () => {
  it('detecta vitória no boss com recompensas', () => {
    const previous = baseState({
      phaseRun: {
        phaseId: '1-2',
        displayName: 'Esgotos Profundos',
        waveIndex: 1,
        waveCount: 2,
        isBossWave: true,
      },
      enemies: [
        {
          id: 'boss-1',
          name: 'Capitão Slime',
          enemyType: 'slime',
          health: 0,
          maxHealth: 50,
          attack: 5,
          defense: 2,
          goldReward: 25,
          xpReward: 40,
          signatureSkills: [],
          combatIntent: null,
          statusEffects: [],
        },
      ],
      heroes: [
        {
          id: 'h1',
          name: 'Arthos',
          heroClass: 'knight',
          emoji: '⚔',
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
          attack: 10,
          defense: 5,
          health: 50,
          maxHealth: 50,
          baseAttributes: { str: 5, dex: 3, int: 1 },
          allocatedAttributes: { str: 0, dex: 0, int: 0 },
          totalAttributes: { str: 5, dex: 3, int: 1 },
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
          statusEffects: [],
        },
      ],
    });

    const next = baseState({
      gold: 125,
      stage: 2,
      phaseRun: null,
      phaseLabel: 'Fase 1-3',
      campaignProgress: {
        selectedPhaseId: '1-3',
        unlockedPhaseIds: ['1-1', '1-2', '1-3'],
        clearedPhaseIds: ['1-1', '1-2'],
        highestTierReached: 2,
        seasonCompleted: false,
      },
      heroes: [
        {
          ...previous.heroes[0],
          level: 2,
          experience: 10,
          experienceToNextLevel: 150,
        },
      ],
    });

    const payload = detectBattleVictory(previous, next);

    expect(payload).not.toBeNull();
    expect(payload?.clearedPhaseName).toBe('Esgotos Profundos');
    expect(payload?.nextPhaseId).toBe('1-3');
    expect(payload?.goldGained).toBe(25);
    expect(payload?.xpGained).toBe(40);
    expect(payload?.tierReached).toBe(2);
    expect(payload?.heroRewards).toHaveLength(1);
    expect(payload?.heroRewards[0].newLevel).toBe(2);
  });

  it('ignora vitórias em waves intermediárias', () => {
    const previous = baseState({
      phaseRun: {
        phaseId: '1-2',
        displayName: 'Esgotos Profundos',
        waveIndex: 0,
        waveCount: 2,
        isBossWave: false,
      },
    });

    const next = baseState({
      phaseRun: {
        phaseId: '1-2',
        displayName: 'Esgotos Profundos',
        waveIndex: 1,
        waveCount: 2,
        isBossWave: true,
      },
      campaignProgress: previous.campaignProgress,
    });

    expect(detectBattleVictory(previous, next)).toBeNull();
  });
});
