export type UpgradeBranchDto = 'combat' | 'chests' | 'equipment' | 'qol' | 'economy';

export type UpgradeNodeStatusDto = 'locked' | 'ready' | 'available' | 'owned';

export const UPGRADE_BRANCH_LABELS: Record<UpgradeBranchDto, string> = {
  combat: 'Combate',
  chests: 'Baús',
  equipment: 'Equipamento',
  qol: 'Qualidade de vida',
  economy: 'Economia',
};

export const UPGRADE_BRANCH_ORDER: UpgradeBranchDto[] = [
  'combat',
  'chests',
  'equipment',
  'qol',
  'economy',
];
