/**
 * Layout do mapa de missões em % do stage (independente da arte).
 * A imagem futura deve respeitar `aspectRatio` e estes landmarks.
 */

export interface MapPercentPoint {
  /** 0–100, eixo horizontal. */
  x: number;
  /** 0–100, eixo vertical. */
  y: number;
}

export interface MissionMapLayout {
  mapId: string;
  /** Largura / altura do stage (ex.: 1.55 ≈ 31:20). */
  aspectRatio: number;
  /** Path relativo em panel/assets — null = só grade (sem fundo). */
  backgroundAssetPath: string | null;
  mainSlot: MapPercentPoint;
  sideSlots: MapPercentPoint[];
  /** Pool de pontos para pins de missões normais. */
  normalPinSlots: MapPercentPoint[];
}

/** Stendra v1 — landmarks estáveis para o artista alinhar a arte depois. */
export const STENDRA_MISSION_MAP_LAYOUT: MissionMapLayout = {
  mapId: 'stendra',
  aspectRatio: 1.55,
  backgroundAssetPath: 'campaign/stendra/map_1.png',
  mainSlot: { x: 52, y: 42 },
  sideSlots: [
    { x: 24, y: 30 },
    { x: 76, y: 34 },
    { x: 28, y: 68 },
    { x: 70, y: 72 },
  ],
  normalPinSlots: [
    { x: 14, y: 18 },
    { x: 38, y: 16 },
    { x: 62, y: 18 },
    { x: 86, y: 22 },
    { x: 12, y: 42 },
    { x: 36, y: 38 },
    { x: 68, y: 48 },
    { x: 88, y: 46 },
    { x: 18, y: 56 },
    { x: 44, y: 58 },
    { x: 58, y: 64 },
    { x: 82, y: 60 },
    { x: 16, y: 78 },
    { x: 48, y: 80 },
    { x: 74, y: 84 },
    { x: 90, y: 78 },
  ],
};

const LAYOUTS: Record<string, MissionMapLayout> = {
  stendra: STENDRA_MISSION_MAP_LAYOUT,
};

export function resolveMissionMapLayout(mapId: string): MissionMapLayout | null {
  return LAYOUTS[mapId] ?? null;
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(items: T[], rng: () => number): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
}

export interface PlacedMissionMarker {
  missionId: string;
  kind: 'main' | 'side' | 'normal';
  point: MapPercentPoint;
}

/**
 * Posiciona main/side em slots fixos e normais em pins do pool (sem colisão).
 * Determinístico por conjunto de ids na oferta.
 */
export function placeMissionsOnLayout(params: {
  layout: MissionMapLayout;
  mainId: string | null;
  sideIds: readonly string[];
  normalIds: readonly string[];
}): PlacedMissionMarker[] {
  const placed: PlacedMissionMarker[] = [];

  if (params.mainId) {
    placed.push({
      missionId: params.mainId,
      kind: 'main',
      point: params.layout.mainSlot,
    });
  }

  params.sideIds.forEach((id, index) => {
    const slot = params.layout.sideSlots[index];
    if (!slot) return;
    placed.push({ missionId: id, kind: 'side', point: slot });
  });

  const pinPool = [...params.layout.normalPinSlots];
  const seed = hashString(
    `${params.layout.mapId}|${[...params.normalIds].sort().join(',')}`,
  );
  shuffleInPlace(pinPool, mulberry32(seed));

  params.normalIds.forEach((id, index) => {
    const point = pinPool[index];
    if (!point) return;
    placed.push({ missionId: id, kind: 'normal', point });
  });

  return placed;
}
