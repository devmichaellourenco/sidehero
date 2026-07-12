import { resolveActSceneById } from '../../domain/campaign/ActSceneCatalog';
import { detectNewlyUnlockedActScene, detectSeasonFinaleEpilogue } from '../../domain/campaign/ActScenePolicy';
import { CampaignProgress } from '../../domain/campaign/CampaignProgress';
import { ActSceneDto } from '../dto/CampaignDto';
import { CampaignProgressDto } from '../dto/GameStateDto';
import { mapActSceneToDto } from './ActSceneDtoMapper';

function toProgress(dto: CampaignProgressDto): CampaignProgress {
  return CampaignProgress.restore({
    unlockedPhaseIds: dto.unlockedPhaseIds,
    clearedPhaseIds: dto.clearedPhaseIds,
    selectedPhaseId: dto.selectedPhaseId,
    highestTierReached: dto.highestTierReached,
    seasonCompleted: dto.seasonCompleted,
    viewedActSceneIds: dto.viewedActSceneIds ?? [],
  });
}

export function detectPendingActSceneDto(
  previous: CampaignProgressDto | null | undefined,
  next: CampaignProgressDto,
): ActSceneDto | null {
  const scene = detectNewlyUnlockedActScene(
    previous ? toProgress(previous) : null,
    toProgress(next),
  );
  if (!scene) return null;

  return mapActSceneToDto(scene, { unlocked: true, viewed: false });
}

export function detectSeasonFinaleEpilogueDto(
  previous: CampaignProgressDto | null | undefined,
  next: CampaignProgressDto,
): ActSceneDto | null {
  const scene = detectSeasonFinaleEpilogue(
    previous ? toProgress(previous) : null,
    toProgress(next),
  );
  if (!scene) return null;

  return mapActSceneToDto(scene, { unlocked: true, viewed: false });
}

export function actSceneDtoFromId(sceneId: string, progress: CampaignProgressDto): ActSceneDto | null {
  const scene = resolveActSceneById(sceneId);
  if (!scene) return null;

  const viewed = (progress.viewedActSceneIds ?? []).includes(sceneId);
  return mapActSceneToDto(scene, { unlocked: true, viewed });
}

export function findActSceneDto(
  actScenes: ActSceneDto[] | undefined,
  sceneId: string,
): ActSceneDto | null {
  return actScenes?.find((scene) => scene.id === sceneId) ?? null;
}
