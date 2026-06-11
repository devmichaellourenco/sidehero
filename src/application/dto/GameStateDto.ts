import { PhaseRunDto } from './CampaignDto';
import { AttributesDto } from './AttributesDto';
import { ChestProgressDto } from '../mappers/ChestProgressMapper';
import { FeatureFlagsDto } from './FeatureFlagsDto';
import { GearUpgradeHintDto } from './GearUpgradeHintDto';

export interface GearRequirementsDto {
  minLevel: number;
  str?: number;
  dex?: number;
  int?: number;
}

export interface HeroActiveSkillStatDto {
  label: string;
  value: string;
}

export interface HeroActiveSkillDto {
  id: string;
  name: string;
  branch: 'offense' | 'defense' | 'utility';
  branchLabel: string;
  description: string;
  currentRank: number;
  maxRank: number;
  scope: 'universal' | 'class';
  scopeLabel: string;
  scalingLabel: string;
  battleStats: HeroActiveSkillStatDto[];
}

export interface HeroDto {
  id: string;
  name: string;
  heroClass: string;
  emoji: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  castSpeed: number;
  critChance: number;
  critDamage: number;
  health: number;
  maxHealth: number;
  baseAttributes: AttributesDto;
  allocatedAttributes: AttributesDto;
  totalAttributes: AttributesDto;
  unspentImprovementPoints: number;
  unspentAscensionPoints: number;
  skillRanks: Record<string, number>;
  equippedSkillIds: string[];
  activeSkills: HeroActiveSkillDto[];
  maxActiveSkills: number;
  unlockedActiveSkillSlots: number;
  ascensionId: string | null;
  hasUnspentPoints: boolean;
  equipment: Record<
    string,
    {
      id: string;
      name: string;
      slot: string;
      rarity: string;
      attackBonus: number;
      defenseBonus: number;
      healthBonus: number;
      attackSpeedBonus: number;
      castSpeedBonus: number;
      critChanceBonus: number;
      critDamageBonus: number;
      requirements: GearRequirementsDto;
    } | null
  >;
  combatIntent: CombatSkillIntentDto | null;
  combatSkillCooldowns: HeroSkillCooldownDto[];
  statusEffects: CombatStatusEffectDto[];
}

export interface HeroSkillCooldownDto {
  skillId: string;
  secondsRemaining: number;
  cooldownTotal: number;
  ready: boolean;
}

export interface CombatStatusEffectDto {
  label: string;
  turnsRemaining: number;
  polarity: 'buff' | 'debuff';
}

export interface CombatSkillIntentDto {
  nextSkillName: string;
  nextSkillId: string;
  status: 'ready' | 'cooldown';
  secondsRemaining: number;
  chargingSkills: Array<{ skillId: string; skillName: string; secondsRemaining: number }>;
}

export interface EnemySignatureSkillDto {
  name: string;
  description: string;
}

export interface EnemyDto {
  id: string;
  name: string;
  enemyType: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  goldReward: number;
  xpReward: number;
  signatureSkills: EnemySignatureSkillDto[];
  combatIntent: CombatSkillIntentDto | null;
  statusEffects: CombatStatusEffectDto[];
}

export interface GearDto {
  id: string;
  name: string;
  slot: string;
  rarity: string;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  attackSpeedBonus: number;
  castSpeedBonus: number;
  critChanceBonus: number;
  critDamageBonus: number;
  requirements: GearRequirementsDto;
}

export interface ChestDto {
  id: string;
  stageEarned: number;
  chestType: string;
  chestLabel: string;
  opened: boolean;
}

export interface ActiveTurnDto {
  side: 'hero' | 'enemy';
  id: string;
}

export interface CampaignProgressDto {
  selectedPhaseId: string;
  unlockedPhaseIds: string[];
  clearedPhaseIds: string[];
  highestTierReached: number;
  seasonCompleted: boolean;
}

export interface GameStateDto {
  heroes: HeroDto[];
  activeParty: HeroDto[];
  activePartyIds: string[];
  benchHeroes: HeroDto[];
  canEditParty: boolean;
  loadoutEditOpen: boolean;
  phaseRestartOnResume: boolean;
  enemies: EnemyDto[];
  enemy: EnemyDto | null;
  activeTurn: ActiveTurnDto | null;
  combatRound: number;
  campaignName: string;
  mapName: string;
  phaseLabel: string;
  phaseRun: PhaseRunDto | null;
  campaignProgress: CampaignProgressDto;
  stage: number;
  difficultyTier: number;
  gold: number;
  chests: ChestDto[];
  inventory: GearDto[];
  battleLog: { message: string; timestamp: number }[];
  totalBattlesWon: number;
  pendingChestCount: number;
  upgradeLevels: Record<string, number>;
  shopRefreshUses: number;
  shopRefreshLimit: number;
  purchasableUpgradeCount: number;
  featureFlags: FeatureFlagsDto;
  chestProgress: ChestProgressDto;
  gearUpgradeHints: Record<string, GearUpgradeHintDto>;
  seasonCompleted: boolean;
}
