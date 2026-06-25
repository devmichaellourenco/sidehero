import { GearDto } from '../../application/dto/GameStateDto';

export interface RewardCelebrationPort {
  celebrateUpgradePurchased(upgradeId: string): void;
  celebrateShopPurchase(gear: GearDto): void;
  celebrateForgeCreated(gear: GearDto): void;
  celebrateAscension(heroName: string, heroEmoji: string): void;
}
