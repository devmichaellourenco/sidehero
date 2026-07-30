import { describe, expect, it } from 'vitest';
import { parseActSceneViewRequest } from './ActSceneViewRelay';

describe('ActSceneViewRelay', () => {
  it('parseia pedido válido', () => {
    expect(parseActSceneViewRequest({ sceneId: 'stendra-act-2', at: 10 })).toEqual({
      sceneId: 'stendra-act-2',
      at: 10,
    });
  });

  it('rejeita payload inválido', () => {
    expect(parseActSceneViewRequest(null)).toBeNull();
    expect(parseActSceneViewRequest({ sceneId: '', at: 1 })).toBeNull();
    expect(parseActSceneViewRequest({ sceneId: 'stendra-act-1' })).toBeNull();
    expect(parseActSceneViewRequest({ at: 1 })).toBeNull();
  });
});
