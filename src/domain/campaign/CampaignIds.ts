import { mapDefinitionByIndex } from './CampaignMaps';

export type CampaignId = 'apprentice';
export type MapId =
  | 'stendra'
  | 'gondonor'
  | 'valdris'
  | 'morthaven'
  | 'broken_sky'
  | 'crimson_abyss'
  | 'eternal_forge'
  | 'ancient_grove'
  | 'twilight_tower'
  | 'void_throne';
export type PhaseId = string;

export const SEASON_FINALE_PHASE_ID = '10-50';

export function formatPhaseLabel(phaseId: PhaseId): string {
  return phaseId.replace('-', '-');
}

export function parsePhaseId(phaseId: PhaseId): { mapIndex: number; phaseNumber: number } {
  const [mapPart, phasePart] = phaseId.split('-');
  return {
    mapIndex: Number.parseInt(mapPart, 10) || 1,
    phaseNumber: Number.parseInt(phasePart, 10) || 1,
  };
}

export function difficultyTierForPhase(mapIndex: number, phaseNumber: number): number {
  return (mapIndex - 1) * 50 + phaseNumber;
}

export function buildPhaseId(mapIndex: number, phaseNumber: number): PhaseId {
  return `${mapIndex}-${phaseNumber}`;
}

export function mapIdFromIndex(mapIndex: number): MapId {
  return mapDefinitionByIndex(mapIndex)?.id ?? 'stendra';
}

export function isMilestonePhase(phaseNumber: number): boolean {
  return phaseNumber % 50 === 0;
}

export function isSeasonFinalePhase(phaseId: PhaseId): boolean {
  return phaseId === SEASON_FINALE_PHASE_ID;
}
