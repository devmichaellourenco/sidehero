export interface CampaignPhaseDto {
  id: string;
  displayName: string;
  waveCount: number;
  difficultyTier: number;
  unlocked: boolean;
  cleared: boolean;
  selected: boolean;
  playable: boolean;
  milestoneBoss: boolean;
  seasonFinale: boolean;
}

export interface CampaignMapDto {
  id: string;
  name: string;
  phases: CampaignPhaseDto[];
}

export interface CampaignOverviewDto {
  id: string;
  name: string;
  maps: CampaignMapDto[];
}

export interface PhaseRunDto {
  phaseId: string;
  displayName: string;
  waveIndex: number;
  waveCount: number;
  isBossWave: boolean;
}
