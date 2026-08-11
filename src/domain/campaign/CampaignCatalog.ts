import { MapId, PhaseId } from './CampaignIds';
import { CAMPAIGN_MAPS } from './CampaignMaps';
import { releasedCampaignMaps, seasonFinalePhaseId } from './CampaignReleaseScope';
import { HANDCRAFTED_PHASES } from './HandcraftedPhaseCatalog';
import { mergePhaseWithEmbeddedOverride } from './PhaseBattleOverrides';
import { PhaseDefinition } from './PhaseDefinition';

export interface CampaignMapInfo {
  id: MapId;
  name: string;
  phaseCount: number;
}

export interface CampaignInfo {
  id: 'apprentice';
  name: string;
  maps: CampaignMapInfo[];
}

const CAMPAIGN: CampaignInfo = {
  id: 'apprentice',
  name: 'Ascensão de Nix',
  maps: releasedCampaignMaps().map((map) => ({
    id: map.id,
    name: map.name,
    phaseCount: map.phaseCount,
  })),
};

const handcraftedMap = new Map(HANDCRAFTED_PHASES.map((phase) => [phase.id, phase]));

export function getCampaignInfo(): CampaignInfo {
  return CAMPAIGN;
}

/** Fase handcrafted + override de batalha do Balance Lab (JSON), se houver. */
export function resolvePhase(phaseId: PhaseId): PhaseDefinition | null {
  const base = handcraftedMap.get(phaseId);
  if (!base) return null;
  return mergePhaseWithEmbeddedOverride(base);
}

export function listPhasesForMap(mapId: MapId): PhaseDefinition[] {
  const map = CAMPAIGN_MAPS.find((entry) => entry.id === mapId);
  if (!map) return [];

  const phases: PhaseDefinition[] = [];
  for (let phaseNumber = 1; phaseNumber <= map.phaseCount; phaseNumber++) {
    const phaseId = `${map.mapIndex}-${phaseNumber}`;
    const phase = resolvePhase(phaseId);
    if (phase) phases.push(phase);
  }
  return phases;
}

export function getSeasonFinalePhase(): PhaseDefinition | null {
  return resolvePhase(seasonFinalePhaseId());
}
