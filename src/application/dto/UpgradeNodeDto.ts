import { UpgradeBranch } from '../../domain/upgrades/UpgradeDefinition';
import { UpgradeNodeStatus } from '../../domain/upgrades/UpgradeService';

export interface UpgradeRequirementDto {
  label: string;
  met: boolean;
}

export interface UpgradeNodeDto {
  id: string;
  feature: string;
  level: number;
  branch: UpgradeBranch;
  name: string;
  description: string;
  cost: number;
  status: UpgradeNodeStatus;
  canAfford: boolean;
  requirements: UpgradeRequirementDto[];
}

export const UPGRADE_BRANCH_LABELS: Record<UpgradeBranch, string> = {
  combat: 'Combate',
  chests: 'Baús',
  equipment: 'Equipamento',
  qol: 'Qualidade de vida',
  economy: 'Economia',
};
