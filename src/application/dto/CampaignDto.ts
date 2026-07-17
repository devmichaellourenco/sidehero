import type { StageProgressDto } from './StageProgressDto';

export interface ActSceneDto {
  id: string;
  mapId: string;
  actNumber: number;
  title: string;
  recap: string;
  preview: string;
  imageAssetPath: string | null;
  unlocked: boolean;
  viewed: boolean;
}

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
  actNumber: number;
  featuredEnemyTypes: string[];
}

export interface CampaignMapDto {
  id: string;
  name: string;
  unlocked: boolean;
  phases: CampaignPhaseDto[];
  actScenes: ActSceneDto[];
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
  /** Timeline de progresso da fase (Stage Progress Bar). */
  stageProgress?: StageProgressDto;
}
