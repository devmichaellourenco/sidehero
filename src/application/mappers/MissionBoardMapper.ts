import { resolvePhase } from '../../domain/campaign/CampaignCatalog';
import { MapId } from '../../domain/campaign/CampaignIds';
import { CampMissionBoard } from '../../domain/campaign/missions/CampMissionBoard';
import { MissionDefinition } from '../../domain/campaign/missions/MissionDefinition';
import { MissionId } from '../../domain/campaign/missions/MissionId';
import { MissionBoardDto, MissionPreviewDto } from '../dto/MissionBoardDto';
import { mapFeaturedEnemyPreviews } from './MissionEnemyPreviewMapper';

export function mapMissionPreview(
  mission: MissionDefinition,
  selectedMissionId: MissionId | null,
): MissionPreviewDto {
  const phase = resolvePhase(mission.phaseTemplateId);
  const featuredEnemies = phase
    ? mapFeaturedEnemyPreviews(phase, { mapId: mission.mapId })
    : [];

  return {
    id: mission.id,
    kind: mission.kind,
    name: mission.name,
    mapId: mission.mapId,
    phaseTemplateId: mission.phaseTemplateId,
    stars: mission.stars ?? null,
    waveCount: phase?.waves.length ?? 1,
    difficultyTier: phase?.difficultyTier ?? 1,
    featuredEnemyTypes: featuredEnemies.map((enemy) => enemy.enemyType),
    featuredEnemies,
    challengeLabel: phase?.challengeLabel,
    challengeHint: phase?.challengeHint,
    rewards: mission.rewards
      ? {
          gold: mission.rewards.gold,
          xp: mission.rewards.xp,
          itemId: mission.rewards.itemId,
          sceneId: mission.rewards.sceneId,
        }
      : null,
    selected: selectedMissionId === mission.id,
  };
}

export function mapMissionBoard(
  board: CampMissionBoard,
  selectedMissionId: MissionId | null,
): MissionBoardDto {
  return {
    mapId: board.mapId as MapId,
    main: board.main ? mapMissionPreview(board.main, selectedMissionId) : null,
    sides: board.sides.map((mission) => mapMissionPreview(mission, selectedMissionId)),
    normals: board.normals.map((mission) => mapMissionPreview(mission, selectedMissionId)),
  };
}
