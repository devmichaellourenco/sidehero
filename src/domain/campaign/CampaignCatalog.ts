import { MapId, PhaseId } from './CampaignIds';
import { CAMPAIGN_MAPS } from './CampaignMaps';
import { HANDCRAFTED_PHASES } from './HandcraftedPhaseCatalog';
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
  name: 'Campanha do Aprendiz',
  maps: CAMPAIGN_MAPS.map((map) => ({
    id: map.id,
    name: map.name,
    phaseCount: map.phaseCount,
  })),
};

const handcraftedMap = new Map(HANDCRAFTED_PHASES.map((phase) => [phase.id, phase]));

export function getCampaignInfo(): CampaignInfo {
  return CAMPAIGN;
}

/** Apenas fases handcrafted — procedural reservado para uso futuro. */
export function resolvePhase(phaseId: PhaseId): PhaseDefinition | null {
  return handcraftedMap.get(phaseId) ?? null;
}

export function listPhasesForMap(mapId: MapId): PhaseDefinition[] {
  const map = CAMPAIGN_MAPS.find((entry) => entry.id === mapId);
  if (!map) return [];

  const phases: PhaseDefinition[] = [];
  for (let phaseNumber = 1; phaseNumber <= map.phaseCount; phaseNumber++) {
    const phaseId = `${map.mapIndex}-${phaseNumber}`;
    const phase = handcraftedMap.get(phaseId);
    if (phase) phases.push(phase);
  }
  return phases;
}

export function getSeasonFinalePhase(): PhaseDefinition | null {
  return handcraftedMap.get('10-50') ?? null;
}
