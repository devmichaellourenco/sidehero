import { describe, expect, it } from 'vitest';
import {
  isSurfacePinnedValue,
  parseSurfaceDockRequest,
  readDetachedSurfaceFromLocation,
  surfacePinnedStorageKey,
} from './SurfacePinPreference';

describe('SurfacePinPreference', () => {
  it('só considera true como pinado', () => {
    expect(isSurfacePinnedValue(true)).toBe(true);
    expect(isSurfacePinnedValue(false)).toBe(false);
    expect(isSurfacePinnedValue(undefined)).toBe(false);
    expect(isSurfacePinnedValue('1')).toBe(false);
  });

  it('gera chave de storage por menu', () => {
    expect(surfacePinnedStorageKey('stats')).toBe('sidehero_surface_pinned_stats');
    expect(surfacePinnedStorageKey('shop')).toBe('sidehero_surface_pinned_shop');
  });

  it('parseia pedido de dock genérico e legado de Stats', () => {
    expect(parseSurfaceDockRequest({ surfaceId: 'shop', at: 10 })).toEqual({
      surfaceId: 'shop',
      at: 10,
    });
    expect(parseSurfaceDockRequest(12345)).toEqual({ surfaceId: 'stats', at: 12345 });
    expect(parseSurfaceDockRequest({ surfaceId: 'nope', at: 1 })).toBeNull();
    expect(parseSurfaceDockRequest(null)).toBeNull();
  });

  it('lê ?detached= da location', () => {
    expect(readDetachedSurfaceFromLocation('?detached=stats')).toBe('stats');
    expect(readDetachedSurfaceFromLocation('?detached=forge')).toBe('forge');
    expect(readDetachedSurfaceFromLocation('?detached=loot')).toBeNull();
    expect(readDetachedSurfaceFromLocation('')).toBeNull();
  });
});
