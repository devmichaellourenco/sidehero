import { MapId, PhaseId, mapIdFromIndex, parsePhaseId } from '../CampaignIds';

export type MissionId = string;

/** Marcos da quest principal por mapa (não confundir com milestoneBoss X-50 de loot). */
export const MAIN_QUEST_PHASE_NUMBERS = [
  1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
] as const;

export type MainQuestPhaseNumber = (typeof MAIN_QUEST_PHASE_NUMBERS)[number];

export function isMainQuestPhaseNumber(phaseNumber: number): boolean {
  return (MAIN_QUEST_PHASE_NUMBERS as readonly number[]).includes(phaseNumber);
}

export function mainMissionId(phaseId: PhaseId): MissionId {
  return `main:${phaseId}`;
}

export function sideMissionId(slug: string): MissionId {
  return `side:${slug}`;
}

export function normalMissionId(phaseId: PhaseId): MissionId {
  return `normal:${phaseId}`;
}

export function parseMissionIdKind(missionId: MissionId): 'main' | 'side' | 'normal' | null {
  if (missionId.startsWith('main:')) return 'main';
  if (missionId.startsWith('side:')) return 'side';
  if (missionId.startsWith('normal:')) return 'normal';
  return null;
}

export function phaseIdFromMainMissionId(missionId: MissionId): PhaseId | null {
  if (!missionId.startsWith('main:')) return null;
  return missionId.slice('main:'.length);
}

export function phaseIdFromNormalMissionId(missionId: MissionId): PhaseId | null {
  if (!missionId.startsWith('normal:')) return null;
  return missionId.slice('normal:'.length);
}

export function mapIdFromMissionPhaseRef(phaseId: PhaseId): MapId {
  return mapIdFromIndex(parsePhaseId(phaseId).mapIndex);
}
