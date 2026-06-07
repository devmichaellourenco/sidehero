import { GameStateDto } from '../../application/dto/GameStateDto';

const SNAPSHOT_KEY = 'sidehero_panel_snapshot';
const MIN_IDLE_MS = 8000;

export interface PanelSnapshot {
  at: number;
  stage: number;
  gold: number;
  pendingChestCount: number;
  heroLevels: Record<string, number>;
}

export function loadPanelSnapshot(): PanelSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PanelSnapshot;
  } catch {
    return null;
  }
}

function buildSnapshot(state: GameStateDto, at = Date.now()): PanelSnapshot {
  return {
    at,
    stage: state.stage,
    gold: state.gold,
    pendingChestCount: state.pendingChestCount,
    heroLevels: Object.fromEntries(state.heroes.map((hero) => [hero.id, hero.level])),
  };
}

export function touchPanelSnapshot(state: GameStateDto): void {
  try {
    sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(buildSnapshot(state)));
  } catch {
    // sessionStorage indisponível
  }
}

export function seedPanelSnapshotIfMissing(state: GameStateDto): void {
  if (loadPanelSnapshot()) return;
  touchPanelSnapshot(state);
}

export function buildIdleSummary(snapshot: PanelSnapshot, state: GameStateDto): string | null {
  const idleMs = Date.now() - snapshot.at;
  if (idleMs < MIN_IDLE_MS) return null;

  const stagesGained = state.stage - snapshot.stage;
  const goldGained = state.gold - snapshot.gold;
  const chestsGained = state.pendingChestCount - snapshot.pendingChestCount;

  const levelUps = state.heroes
    .filter((hero) => {
      const previousLevel = snapshot.heroLevels[hero.id];
      return previousLevel !== undefined && hero.level > previousLevel;
    })
    .map((hero) => `${hero.name} Lv.${hero.level}`);

  const parts: string[] = [];

  if (stagesGained > 0) {
    parts.push(`+${stagesGained} stage${stagesGained > 1 ? 's' : ''}`);
  }

  if (goldGained > 0) {
    parts.push(`+${goldGained} ouro`);
  }

  if (chestsGained > 0) {
    parts.push(`+${chestsGained} baú${chestsGained > 1 ? 's' : ''}`);
  }

  if (levelUps.length > 0) {
    parts.push(levelUps.join(', '));
  }

  if (parts.length === 0) return null;

  return `Enquanto você estava fora: ${parts.join(' · ')}`;
}
