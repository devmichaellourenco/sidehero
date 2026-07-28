import {
  buildDetachedSurfaceUrl,
  getDetachedSurfaceWindowCreateOptions,
  getDetachedSurfaceWindowFixedSize,
  isDetachedSurfaceId,
  isDetachedSurfaceWindowSizeLocked,
  resolveReusableWindowId,
  type DetachedSurfaceId,
} from './DetachedSurfaceWindowManager';

const windowsBySurface = new Map<DetachedSurfaceId, number>();
const surfaceByWindow = new Map<number, DetachedSurfaceId>();
let isClampingBounds = false;

function forgetWindow(windowId: number): void {
  const surfaceId = surfaceByWindow.get(windowId);
  surfaceByWindow.delete(windowId);
  if (surfaceId && windowsBySurface.get(surfaceId) === windowId) {
    windowsBySurface.delete(surfaceId);
  }
}

async function enforceFixedSize(windowId: number): Promise<void> {
  const size = getDetachedSurfaceWindowFixedSize();
  await chrome.windows.update(windowId, {
    width: size.width,
    height: size.height,
  });
}

export async function openOrFocusDetachedSurface(
  surfaceId: DetachedSurfaceId,
): Promise<number | null> {
  const tracked = windowsBySurface.get(surfaceId) ?? null;
  if (tracked != null) {
    try {
      const existing = await chrome.windows.getAll();
      const reusable = resolveReusableWindowId(
        tracked,
        existing.map((window) => window.id).filter((id): id is number => typeof id === 'number'),
      );
      if (reusable != null) {
        await chrome.windows.update(reusable, {
          focused: true,
          ...getDetachedSurfaceWindowFixedSize(),
        });
        return reusable;
      }
      forgetWindow(tracked);
    } catch {
      forgetWindow(tracked);
    }
  }

  const url = buildDetachedSurfaceUrl((path) => chrome.runtime.getURL(path), surfaceId);
  const created = await chrome.windows.create(getDetachedSurfaceWindowCreateOptions(url));
  const windowId = created.id ?? null;
  if (windowId == null) return null;

  windowsBySurface.set(surfaceId, windowId);
  surfaceByWindow.set(windowId, surfaceId);
  return windowId;
}

export async function closeDetachedSurface(surfaceId: DetachedSurfaceId): Promise<void> {
  const windowId = windowsBySurface.get(surfaceId);
  if (windowId == null) return;
  forgetWindow(windowId);
  try {
    await chrome.windows.remove(windowId);
  } catch {
    // já fechada
  }
}

export function registerDetachedSurfaceWindowLifecycle(): void {
  chrome.windows.onRemoved.addListener((windowId) => {
    forgetWindow(windowId);
  });

  chrome.windows.onBoundsChanged.addListener((window) => {
    if (window.id == null || isClampingBounds) return;
    if (!surfaceByWindow.has(window.id)) return;
    if (isDetachedSurfaceWindowSizeLocked(window.width, window.height)) return;

    isClampingBounds = true;
    void enforceFixedSize(window.id)
      .catch(() => undefined)
      .finally(() => {
        isClampingBounds = false;
      });
  });
}

export function parseDetachedSurfaceId(value: unknown): DetachedSurfaceId | null {
  return typeof value === 'string' && isDetachedSurfaceId(value) ? value : null;
}
