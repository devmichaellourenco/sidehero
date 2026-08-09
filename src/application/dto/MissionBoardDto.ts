import type { MissionKind } from '../../domain/campaign/missions/MissionKind';

export interface MissionRewardDto {
  gold?: number;
  xp?: number;
  itemId?: string;
  sceneId?: string;
}

export interface MissionPreviewDto {
  id: string;
  kind: MissionKind;
  name: string;
  mapId: string;
  phaseTemplateId: string;
  stars: number | null;
  waveCount: number;
  difficultyTier: number;
  featuredEnemyTypes: string[];
  challengeLabel?: string;
  challengeHint?: string;
  rewards: MissionRewardDto | null;
  selected: boolean;
}

export interface MissionBoardDto {
  mapId: string;
  main: MissionPreviewDto | null;
  sides: MissionPreviewDto[];
  normals: MissionPreviewDto[];
}
