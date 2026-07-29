import type { SystemsMenuId } from '../flows/SystemsMenuNavigation';
import { SYSTEMS_MENU_ORDER } from '../flows/SystemsMenuNavigation';
import { isDetachedSurfaceId } from '../../infrastructure/background/DetachedSurfaceWindowManager';

export const SURFACE_PINNED_PREFIX = 'sidehero_surface_pinned_';
/** Pedido de dock: `{ surfaceId, at }`. */
export const SURFACE_DOCK_REQUEST_KEY = 'sidehero_surface_dock_request';

/** Legado (só Stats) — migrado em leitura para a chave genérica. */
export const LEGACY_BATTLE_STATS_PINNED_KEY = 'sidehero_battle_stats_pinned';
export const LEGACY_BATTLE_STATS_DOCK_REQUEST_KEY = 'sidehero_battle_stats_dock_at';

const SURFACE_ID_SET = new Set<string>(SYSTEMS_MENU_ORDER);

export function isSystemsMenuId(value: string | null | undefined): value is SystemsMenuId {
  return Boolean(value && SURFACE_ID_SET.has(value));
}

export function surfacePinnedStorageKey(surfaceId: SystemsMenuId): string {
  return `${SURFACE_PINNED_PREFIX}${surfaceId}`;
}

export function isSurfacePinnedValue(value: unknown): boolean {
  return value === true;
}

const DEFAULT_PINNED_MODAL_SURFACES: ReadonlySet<SystemsMenuId> = new Set([
  'formation',
  'campaign',
  'shop',
  'stash',
  'forge',
  'upgrades',
  'achievements',
  'settings',
]);

export function hasSurfacePinnedPreference(value: unknown): boolean {
  return value === true || value === false;
}

export function defaultSurfacePinned(surfaceId: SystemsMenuId): boolean {
  return DEFAULT_PINNED_MODAL_SURFACES.has(surfaceId);
}

export async function readSurfacePinned(surfaceId: SystemsMenuId): Promise<boolean> {
  try {
    const key = surfacePinnedStorageKey(surfaceId);
    const keys =
      surfaceId === 'stats' ? [key, LEGACY_BATTLE_STATS_PINNED_KEY] : [key];
    const result = await chrome.storage.local.get(keys);
    if (hasSurfacePinnedPreference(result[key])) {
      return isSurfacePinnedValue(result[key]);
    }
    if (
      surfaceId === 'stats' &&
      hasSurfacePinnedPreference(result[LEGACY_BATTLE_STATS_PINNED_KEY])
    ) {
      return isSurfacePinnedValue(result[LEGACY_BATTLE_STATS_PINNED_KEY]);
    }
    return defaultSurfacePinned(surfaceId);
  } catch {
    return defaultSurfacePinned(surfaceId);
  }
}

export async function writeSurfacePinned(
  surfaceId: SystemsMenuId,
  pinned: boolean,
): Promise<void> {
  try {
    const payload: Record<string, boolean> = {
      [surfacePinnedStorageKey(surfaceId)]: pinned,
    };
    if (surfaceId === 'stats') {
      payload[LEGACY_BATTLE_STATS_PINNED_KEY] = pinned;
    }
    await chrome.storage.local.set(payload);
  } catch {
    // storage indisponível
  }
}

export interface SurfaceDockRequest {
  surfaceId: SystemsMenuId;
  at: number;
}

export function parseSurfaceDockRequest(value: unknown): SurfaceDockRequest | null {
  if (typeof value === 'number') {
    // legado: só timestamp de dock de Stats
    return { surfaceId: 'stats', at: value };
  }
  if (!value || typeof value !== 'object') return null;
  const record = value as { surfaceId?: unknown; at?: unknown };
  if (typeof record.surfaceId !== 'string' || !isSystemsMenuId(record.surfaceId)) {
    return null;
  }
  if (typeof record.at !== 'number') return null;
  return { surfaceId: record.surfaceId, at: record.at };
}

/** Marca como fixado e pede ao side panel principal para abrir o sheet. */
export async function requestDockSurfaceToSidePanel(surfaceId: SystemsMenuId): Promise<void> {
  try {
    await chrome.storage.local.set({
      [surfacePinnedStorageKey(surfaceId)]: true,
      ...(surfaceId === 'stats' ? { [LEGACY_BATTLE_STATS_PINNED_KEY]: true } : {}),
      [SURFACE_DOCK_REQUEST_KEY]: { surfaceId, at: Date.now() } satisfies SurfaceDockRequest,
    });
  } catch {
    // storage indisponível
  }
}

export function readDetachedSurfaceFromLocation(
  search: string = typeof location !== 'undefined' ? location.search : '',
): SystemsMenuId | null {
  try {
    const params = new URLSearchParams(search);
    const raw = params.get('detached');
    if (!isSystemsMenuId(raw) || !isDetachedSurfaceId(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}
