import { resolvePhase } from '../CampaignCatalog';
import { buildPhaseId, MapId, PhaseId } from '../CampaignIds';
import { CAMPAIGN_MAPS } from '../CampaignMaps';
import {
  BASE_GAME_MAX_MAP_INDEX,
  CampaignReleaseProfile,
  CAMPAIGN_RELEASE_PROFILE,
  isMapReleased,
} from '../CampaignReleaseScope';
import { MissionDefinition } from './MissionDefinition';
import {
  isMainQuestPhaseNumber,
  MAIN_QUEST_PHASE_NUMBERS,
  mainMissionId,
  MissionId,
  normalMissionId,
  sideMissionId,
} from './MissionId';
import { MissionStars } from './MissionKind';

/** Títulos temáticos dos marcos (X-50 usa displayName da fase). */
const MAIN_QUEST_TITLES: Record<number, string> = {
  1: 'Primeiros Passos',
  5: 'Alerta nas Fronteiras',
  10: 'Linha de Defesa',
  15: 'Marcha do Ato',
  20: 'Prova do Segundo Ato',
  25: 'Meio do Caminho',
  30: 'Pressão Crescente',
  35: 'Sombras Adiante',
  40: 'Antes do Assalto',
  45: 'Último Fôlego',
  50: 'Guardião do Mapa',
};

const NORMAL_NAME_POOL: Record<MissionStars, readonly string[]> = {
  1: ['Patrulha leve', 'Caça miúda', 'Ronda da aldeia', 'Trilha segura'],
  2: ['Emboscada curta', 'Posto avançado', 'Caça de elite menor', 'Rota sombreada'],
  3: ['Assalto médio', 'Covil inquieto', 'Linha hostil', 'Cerco rápido'],
  4: ['Incursão pesada', 'Guarnição inimiga', 'Passe perigoso', 'Ninho de elite'],
  5: ['Assalto brutal', 'Covil do terror', 'Última linha', 'Prova de fogo'],
};

function starsForNormalPhase(phaseNumber: number): MissionStars {
  if (phaseNumber <= 12) return 1;
  if (phaseNumber <= 22) return 2;
  if (phaseNumber <= 32) return 3;
  if (phaseNumber <= 42) return 4;
  return 5;
}

function normalRewardsForStars(stars: MissionStars): { gold: number; xp: number } {
  return {
    gold: 8 + stars * 6,
    xp: 6 + stars * 4,
  };
}

function normalMissionName(mapName: string, phaseNumber: number, stars: MissionStars): string {
  const pool = NORMAL_NAME_POOL[stars];
  const label = pool[phaseNumber % pool.length]!;
  return `${label} · ${mapName}`;
}

function mainMissionName(mapName: string, phaseId: PhaseId, phaseNumber: number): string {
  if (phaseNumber === 50) {
    const phase = resolvePhase(phaseId);
    if (phase?.displayName) return phase.displayName;
  }
  const title = MAIN_QUEST_TITLES[phaseNumber] ?? `Marco ${phaseId}`;
  return `${title} · ${mapName}`;
}

function buildMainMissions(mapIndex: number, mapId: MapId, mapName: string): MissionDefinition[] {
  return MAIN_QUEST_PHASE_NUMBERS.map((phaseNumber) => {
    const phaseId = buildPhaseId(mapIndex, phaseNumber);
    return {
      id: mainMissionId(phaseId),
      kind: 'main' as const,
      mapId,
      name: mainMissionName(mapName, phaseId, phaseNumber),
      phaseTemplateId: phaseId,
      stars: phaseNumber === 50 ? 5 : phaseNumber >= 40 ? 4 : phaseNumber >= 20 ? 3 : 2,
    };
  });
}

function buildNormalMissions(mapIndex: number, mapId: MapId, mapName: string): MissionDefinition[] {
  const missions: MissionDefinition[] = [];
  for (let phaseNumber = 1; phaseNumber <= 50; phaseNumber += 1) {
    if (isMainQuestPhaseNumber(phaseNumber)) continue;
    const phaseId = buildPhaseId(mapIndex, phaseNumber);
    const stars = starsForNormalPhase(phaseNumber);
    missions.push({
      id: normalMissionId(phaseId),
      kind: 'normal',
      mapId,
      name: normalMissionName(mapName, phaseNumber, stars),
      phaseTemplateId: phaseId,
      stars,
      rewards: normalRewardsForStars(stars),
    });
  }
  return missions;
}

/** Sides piloto — cadeias + paralelas nos quatro mapas base. */
function buildPilotSideMissions(): MissionDefinition[] {
  const stendraAsh = sideMissionId('stendra_ash_trail');
  const stendraCache = sideMissionId('stendra_hidden_cache');
  const stendraPatrol = sideMissionId('stendra_wayward_patrol');
  const gruftallScout = sideMissionId('gruftall_ash_scout');
  const valdrisWhisper = sideMissionId('valdris_whisper');
  const morthavenRun = sideMissionId('morthaven_seal_run');

  return [
    {
      id: stendraAsh,
      kind: 'side',
      mapId: 'stendra',
      name: 'Trilha de Cinzas',
      phaseTemplateId: '1-6',
      stars: 2,
      unlockAfterMissionIds: [mainMissionId('1-5')],
      rewards: { gold: 40, xp: 25, sceneId: 'side:stendra_ash_trail' },
    },
    {
      id: stendraCache,
      kind: 'side',
      mapId: 'stendra',
      name: 'Esconderijo Oculto',
      phaseTemplateId: '1-8',
      stars: 3,
      unlockAfterMissionIds: [stendraAsh],
      rewards: {
        gold: 60,
        xp: 40,
        itemId: 'side_stendra_cache_charm',
        sceneId: 'side:stendra_hidden_cache',
      },
    },
    {
      id: stendraPatrol,
      kind: 'side',
      mapId: 'stendra',
      name: 'Patrulha Desgarrada',
      phaseTemplateId: '1-3',
      stars: 1,
      unlockAfterMissionIds: [mainMissionId('1-1')],
      rewards: { gold: 20, xp: 15 },
    },
    {
      id: gruftallScout,
      kind: 'side',
      mapId: 'gruftall',
      name: 'Batedor nas Cinzas',
      phaseTemplateId: '2-6',
      stars: 2,
      unlockAfterMissionIds: [mainMissionId('2-5')],
      rewards: { gold: 45, xp: 30, sceneId: 'side:gruftall_ash_scout' },
    },
    {
      id: valdrisWhisper,
      kind: 'side',
      mapId: 'valdris',
      name: 'Sussurro nas Ruínas',
      phaseTemplateId: '3-3',
      stars: 2,
      unlockAfterMissionIds: [mainMissionId('3-1')],
      rewards: { gold: 50, xp: 35, sceneId: 'side:valdris_whisper' },
    },
    {
      id: morthavenRun,
      kind: 'side',
      mapId: 'morthaven',
      name: 'Corrida ao Selo',
      phaseTemplateId: '4-12',
      stars: 3,
      unlockAfterMissionIds: [mainMissionId('4-10')],
      rewards: { gold: 70, xp: 45, sceneId: 'side:morthaven_seal_run' },
    },
  ];
}

function buildCatalogForMaps(maxMapIndex: number): MissionDefinition[] {
  const missions: MissionDefinition[] = [];
  for (const map of CAMPAIGN_MAPS) {
    if (map.mapIndex > maxMapIndex) continue;
    missions.push(...buildMainMissions(map.mapIndex, map.id, map.name));
    missions.push(...buildNormalMissions(map.mapIndex, map.id, map.name));
  }
  missions.push(...buildPilotSideMissions().filter((mission) => {
    const map = CAMPAIGN_MAPS.find((entry) => entry.id === mission.mapId);
    return Boolean(map && map.mapIndex <= maxMapIndex);
  }));
  return missions;
}

const CATALOG_BASE = buildCatalogForMaps(BASE_GAME_MAX_MAP_INDEX);
const CATALOG_FULL = buildCatalogForMaps(10);

const BY_ID_BASE = new Map(CATALOG_BASE.map((m) => [m.id, m]));
const BY_ID_FULL = new Map(CATALOG_FULL.map((m) => [m.id, m]));

export function listMissionCatalog(
  profile: CampaignReleaseProfile = CAMPAIGN_RELEASE_PROFILE,
): readonly MissionDefinition[] {
  return profile === 'full' ? CATALOG_FULL : CATALOG_BASE;
}

export function getMissionById(
  missionId: MissionId,
  profile: CampaignReleaseProfile = CAMPAIGN_RELEASE_PROFILE,
): MissionDefinition | undefined {
  return (profile === 'full' ? BY_ID_FULL : BY_ID_BASE).get(missionId);
}

export function listMainMissionsForMap(
  mapId: MapId,
  profile: CampaignReleaseProfile = CAMPAIGN_RELEASE_PROFILE,
): MissionDefinition[] {
  return listMissionCatalog(profile).filter((m) => m.kind === 'main' && m.mapId === mapId);
}

export function listNormalMissionsForMap(
  mapId: MapId,
  stars?: MissionStars,
  profile: CampaignReleaseProfile = CAMPAIGN_RELEASE_PROFILE,
): MissionDefinition[] {
  return listMissionCatalog(profile).filter(
    (m) =>
      m.kind === 'normal' &&
      m.mapId === mapId &&
      (stars === undefined || m.stars === stars),
  );
}

export function listSideMissionsForMap(
  mapId: MapId,
  profile: CampaignReleaseProfile = CAMPAIGN_RELEASE_PROFILE,
): MissionDefinition[] {
  return listMissionCatalog(profile).filter((m) => m.kind === 'side' && m.mapId === mapId);
}

export function isMissionReleased(
  mission: MissionDefinition,
  profile: CampaignReleaseProfile = CAMPAIGN_RELEASE_PROFILE,
): boolean {
  const map = CAMPAIGN_MAPS.find((entry) => entry.id === mission.mapId);
  if (!map) return false;
  return isMapReleased(map.mapIndex, profile);
}

export function phaseTemplateForMission(
  missionId: MissionId,
  profile: CampaignReleaseProfile = CAMPAIGN_RELEASE_PROFILE,
): PhaseId | null {
  return getMissionById(missionId, profile)?.phaseTemplateId ?? null;
}

/** Id do item exclusivo piloto (Stendra — Esconderijo). */
export const SIDE_STENDRA_CACHE_CHARM_ID = 'side_stendra_cache_charm';
