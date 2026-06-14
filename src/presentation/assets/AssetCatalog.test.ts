import { beforeAll, describe, expect, it } from 'vitest';
import { getEnemySpriteUrl } from './AssetCatalog';

beforeAll(() => {
  Object.assign(globalThis, {
    chrome: {
      runtime: {
        id: 'test-extension',
        getURL: (path: string) => `chrome-extension://test/${path}`,
      },
    },
  });
});

describe('AssetCatalog — sprites de inimigo', () => {
  it('usa goblin para comum', () => {
    const url = getEnemySpriteUrl('goblin_raider', 'Goblin Saqueador Lv.3');
    expect(url).toContain('characters/goblin.png');
    expect(url).not.toContain('goblin_boss');
  });

  it('usa goblin_boss para subchefe/chefe', () => {
    const url = getEnemySpriteUrl('hill_ogre', 'Ogro das Colinas');
    expect(url).toContain('characters/goblin_boss.png');
  });

  it('usa saci_boss para Saci', () => {
    const url = getEnemySpriteUrl('saci', 'Saci');
    expect(url).toContain('characters/saci_boss.png');
  });
});
