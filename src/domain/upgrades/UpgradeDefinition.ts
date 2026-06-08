import { FeatureKey } from './FeatureKey';
import { UpgradeRequirement } from './UpgradeRequirement';

export type UpgradeBranch = 'combat' | 'chests' | 'equipment' | 'qol' | 'economy';

export interface UpgradeDefinition {
  id: string;
  feature: FeatureKey;
  level: number;
  branch: UpgradeBranch;
  name: string;
  description: string;
  cost: number;
  requirements: UpgradeRequirement[];
}
