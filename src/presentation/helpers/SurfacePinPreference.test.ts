import { describe, expect, it } from 'vitest';
import {
  defaultSurfacePinned,
  hasSurfacePinnedPreference,
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

  it('distingue preferência gravada de valor ausente', () => {
    expect(hasSurfacePinnedPreference(true)).toBe(true);
    expect(hasSurfacePinnedPreference(false)).toBe(true);
    expect(hasSurfacePinnedPreference(undefined)).toBe(false);
  });

  it('abre modais fixados por padrão e mantém overlays/drawers como hoje', () => {
    expect(defaultSurfacePinned('campaign')).toBe(true);
    expect(defaultSurfacePinned('shop')).toBe(true);
    expect(defaultSurfacePinned('settings')).toBe(true);
    expect(defaultSurfacePinned('heroes')).toBe(false);
    expect(defaultSurfacePinned('inventory')).toBe(false);
    expect(defaultSurfacePinned('log')).toBe(false);
    expect(defaultSurfacePinned('stats')).toBe(false);
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
