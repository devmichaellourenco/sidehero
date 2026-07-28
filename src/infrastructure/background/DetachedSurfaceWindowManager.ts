/** IDs de menus destacáveis (espelha a barra de sistemas). */
export const DETACHED_SURFACE_IDS = [
  'heroes',
  'formation',
  'log',
  'stats',
  'campaign',
  'shop',
  'inventory',
  'stash',
  'forge',
  'upgrades',
  'achievements',
  'settings',
] as const;

export type DetachedSurfaceId = (typeof DETACHED_SURFACE_IDS)[number];

const SURFACE_ID_SET = new Set<string>(DETACHED_SURFACE_IDS);

export function isDetachedSurfaceId(value: string | null | undefined): value is DetachedSurfaceId {
  return Boolean(value && SURFACE_ID_SET.has(value));
}

/** Decide se reaproveita o id de janela já aberto. */
export function resolveReusableWindowId(
  trackedId: number | null,
  openWindowIds: readonly number[],
): number | null {
  if (trackedId == null) return null;
  return openWindowIds.includes(trackedId) ? trackedId : null;
}

/** Base 400×640 + 30%. */
export const DETACHED_SURFACE_WINDOW_WIDTH = Math.round(400 * 1.3);
export const DETACHED_SURFACE_WINDOW_HEIGHT = Math.round(640 * 1.3);

export function getDetachedSurfaceWindowFixedSize(): { width: number; height: number } {
  return {
    width: DETACHED_SURFACE_WINDOW_WIDTH,
    height: DETACHED_SURFACE_WINDOW_HEIGHT,
  };
}

export function isDetachedSurfaceWindowSizeLocked(
  width: number | undefined,
  height: number | undefined,
): boolean {
  return width === DETACHED_SURFACE_WINDOW_WIDTH && height === DETACHED_SURFACE_WINDOW_HEIGHT;
}

export function getDetachedSurfaceWindowCreateOptions(url: string): chrome.windows.CreateData {
  const size = getDetachedSurfaceWindowFixedSize();
  return {
    url,
    type: 'popup',
    width: size.width,
    height: size.height,
    focused: true,
  };
}

export function buildDetachedSurfaceUrl(extensionGetUrl: (path: string) => string, surfaceId: string): string {
  return `${extensionGetUrl('panel/panel.html')}?detached=${encodeURIComponent(surfaceId)}`;
}
