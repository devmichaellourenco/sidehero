import type { MissionKind } from '../../domain/campaign/missions/MissionKind';
import type { EnemyDto } from './GameStateDto';

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
  /** @deprecated Preferir featuredEnemies para tooltips com stats. */
  featuredEnemyTypes: string[];
  /** Inimigos em destaque com ficha de combate para preview/tooltip. */
  featuredEnemies: EnemyDto[];
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
