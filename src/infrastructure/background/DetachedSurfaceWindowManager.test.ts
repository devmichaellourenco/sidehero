import { describe, expect, it } from 'vitest';
import {
  buildDetachedSurfaceUrl,
  getDetachedSurfaceWindowCreateOptions,
  getDetachedSurfaceWindowFixedSize,
  isDetachedSurfaceId,
  isDetachedSurfaceWindowSizeLocked,
  resolveReusableWindowId,
} from './DetachedSurfaceWindowManager';

describe('DetachedSurfaceWindowManager', () => {
  it('reconhece ids de superfície destacável', () => {
    expect(isDetachedSurfaceId('stats')).toBe(true);
    expect(isDetachedSurfaceId('heroes')).toBe(true);
    expect(isDetachedSurfaceId('loot')).toBe(false);
    expect(isDetachedSurfaceId(null)).toBe(false);
  });

  it('reusa janela rastreada quando ainda aberta', () => {
    expect(resolveReusableWindowId(7, [3, 7, 9])).toBe(7);
    expect(resolveReusableWindowId(7, [3, 9])).toBe(null);
    expect(resolveReusableWindowId(null, [7])).toBe(null);
  });

  it('cria popup com tamanho fixo +30%', () => {
    const size = getDetachedSurfaceWindowFixedSize();
    expect(size).toEqual({ width: 520, height: 832 });

    const options = getDetachedSurfaceWindowCreateOptions(
      'chrome-extension://x/panel/panel.html?detached=shop',
    );
    expect(options.type).toBe('popup');
    expect(options.width).toBe(520);
    expect(options.height).toBe(832);
    expect(options.focused).toBe(true);
    expect(options.url).toContain('detached=shop');

    expect(isDetachedSurfaceWindowSizeLocked(520, 832)).toBe(true);
    expect(isDetachedSurfaceWindowSizeLocked(400, 640)).toBe(false);
  });

  it('monta URL panel.html?detached=', () => {
    const url = buildDetachedSurfaceUrl((path) => `chrome-extension://x/${path}`, 'log');
    expect(url).toBe('chrome-extension://x/panel/panel.html?detached=log');
  });
});
