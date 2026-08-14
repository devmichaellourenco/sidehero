import { parsePhaseId } from '../CampaignIds';
import { MAIN_QUEST_PHASE_NUMBERS } from './MissionId';
import { MissionDefinition } from './MissionDefinition';
import { MissionId } from './MissionId';
import { getMissionById } from './MissionCatalog';

/**
 * Capítulo da main incompleta atual: do marco atual até o próximo (inclusive).
 * Ex.: main 1-1 → fases 1–5; main 1-5 → 5–10; main 1-10 → 10–15.
 * Normais e secundárias do board usam esta faixa.
 */
export function normalPhaseNumberBandForCurrentMain(currentMainPhaseNumber: number): {
  min: number;
  max: number;
} {
  const mains = MAIN_QUEST_PHASE_NUMBERS as readonly number[];
  const current = Math.max(1, Math.min(50, Math.floor(currentMainPhaseNumber)));
  const chapterStart = [...mains].filter((n) => n <= current).pop() ?? 1;
  const nextMain = mains.find((n) => n > chapterStart) ?? chapterStart;

  return {
    min: chapterStart,
    max: nextMain,
  };
}

/** Marco dono do capítulo que contém a fase (maior main ≤ phaseNumber). */
export function chapterMainPhaseForPhaseNumber(phaseNumber: number): number {
  const mains = MAIN_QUEST_PHASE_NUMBERS as readonly number[];
  const n = Math.max(1, Math.min(50, Math.floor(phaseNumber)));
  return [...mains].filter((main) => main <= n).pop() ?? 1;
}

export function listMissionChapterOptions(): Array<{
  mainPhase: number;
  min: number;
  max: number;
  label: string;
}> {
  return (MAIN_QUEST_PHASE_NUMBERS as readonly number[]).map((mainPhase) => {
    const { min, max } = normalPhaseNumberBandForCurrentMain(mainPhase);
    return {
      mainPhase,
      min,
      max,
      label: `Cap. ${mainPhase} · fases ${min}–${max}`,
    };
  });
}

export function isNormalPhaseInBandForMain(
  phaseNumber: number,
  currentMainPhaseNumber: number,
): boolean {
  const { min, max } = normalPhaseNumberBandForCurrentMain(currentMainPhaseNumber);
  return phaseNumber >= min && phaseNumber <= max;
}

export function isMissionPhaseInMainChapterBand(
  phaseTemplateId: string,
  currentMainPhaseNumber: number,
): boolean {
  const phaseNumber = parsePhaseId(phaseTemplateId).phaseNumber;
  return isNormalPhaseInBandForMain(phaseNumber, currentMainPhaseNumber);
}

export function filterNormalMissionIdsForMainBand(
  missionIds: readonly MissionId[],
  currentMainPhaseNumber: number,
): MissionId[] {
  return missionIds.filter((id) => {
    const mission = getMissionById(id);
    if (!mission || mission.kind !== 'normal') return false;
    return isMissionPhaseInMainChapterBand(mission.phaseTemplateId, currentMainPhaseNumber);
  });
}

export function filterNormalMissionsForMainBand(
  missions: readonly MissionDefinition[],
  currentMainPhaseNumber: number,
): MissionDefinition[] {
  return missions.filter((mission) => {
    if (mission.kind !== 'normal') return false;
    return isMissionPhaseInMainChapterBand(mission.phaseTemplateId, currentMainPhaseNumber);
  });
}

/** Secundárias do capítulo da main atual (template na faixa; unlock/expiração à parte). */
export function filterSideMissionsForMainBand(
  missions: readonly MissionDefinition[],
  currentMainPhaseNumber: number,
): MissionDefinition[] {
  return missions.filter((mission) => {
    if (mission.kind !== 'side') return false;
    return isMissionPhaseInMainChapterBand(mission.phaseTemplateId, currentMainPhaseNumber);
  });
}
