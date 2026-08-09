import { CampaignReleaseProfile, CAMPAIGN_RELEASE_PROFILE } from '../CampaignReleaseScope';
import { getMissionById, listMissionCatalog } from './MissionCatalog';
import { MissionId } from './MissionId';

/**
 * Missão side está elegível se todas as `unlockAfterMissionIds` estão concluídas
 * e ela própria ainda não foi concluída.
 */
export function isSideMissionUnlocked(
  missionId: MissionId,
  completedMissionIds: ReadonlySet<MissionId> | readonly MissionId[],
  profile: CampaignReleaseProfile = CAMPAIGN_RELEASE_PROFILE,
): boolean {
  const completed =
    completedMissionIds instanceof Set
      ? completedMissionIds
      : new Set(completedMissionIds);
  if (completed.has(missionId)) return false;

  const mission = getMissionById(missionId, profile);
  if (!mission || mission.kind !== 'side') return false;

  const reqs = mission.unlockAfterMissionIds ?? [];
  return reqs.every((id) => completed.has(id));
}

/** Sides cujo pré-requisito inclui `completedMissionId` (efeito imediato ao concluir). */
export function sideMissionsUnlockedByCompleting(
  completedMissionId: MissionId,
  alreadyCompleted: ReadonlySet<MissionId> | readonly MissionId[],
  profile: CampaignReleaseProfile = CAMPAIGN_RELEASE_PROFILE,
): MissionId[] {
  const completed = new Set(
    alreadyCompleted instanceof Set ? alreadyCompleted : alreadyCompleted,
  );
  completed.add(completedMissionId);

  return listMissionCatalog(profile)
    .filter((m) => m.kind === 'side')
    .filter((m) => (m.unlockAfterMissionIds ?? []).includes(completedMissionId))
    .filter((m) => isSideMissionUnlocked(m.id, completed, profile))
    .map((m) => m.id);
}

export function listEligibleSideMissionIds(
  mapId: string,
  completedMissionIds: ReadonlySet<MissionId> | readonly MissionId[],
  profile: CampaignReleaseProfile = CAMPAIGN_RELEASE_PROFILE,
): MissionId[] {
  return listMissionCatalog(profile)
    .filter((m) => m.kind === 'side' && m.mapId === mapId)
    .filter((m) => isSideMissionUnlocked(m.id, completedMissionIds, profile))
    .map((m) => m.id);
}
