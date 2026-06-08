import { AttributesDto } from './AttributesDto';
import { ChestProgressDto } from '../mappers/ChestProgressMapper';
import { FeatureFlagsDto } from './FeatureFlagsDto';

export interface GearRequirementsDto {
  minLevel: number;
  str?: number;
  dex?: number;
  int?: number;
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
  health: number;
  maxHealth: number;
  baseAttributes: AttributesDto;
  allocatedAttributes: AttributesDto;
  totalAttributes: AttributesDto;
  unspentImprovementPoints: number;
  unspentAscensionPoints: number;
  skillRanks: Record<string, number>;
  equippedSkillIds: string[];
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
      requirements: GearRequirementsDto;
    } | null
  >;
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
}

export interface GearDto {
  id: string;
  name: string;
  slot: string;
  rarity: string;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  requirements: GearRequirementsDto;
}

export interface ChestDto {
  id: string;
  stageEarned: number;
  opened: boolean;
}

export interface GameStateDto {
  heroes: HeroDto[];
  enemy: EnemyDto | null;
  stage: number;
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
}
