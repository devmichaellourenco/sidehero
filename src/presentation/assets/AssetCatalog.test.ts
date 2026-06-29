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

  it('usa goblin_arqueiro para Goblin Arqueiro', () => {
    const url = getEnemySpriteUrl('goblin_archer', 'Goblin Arqueiro Lv.3', 'enemy-a');
    expect(url).toContain('characters/goblin_archer.png');
    expect(url).not.toContain('goblin_boss');
  });

  it('alterna sprite de arqueiro por instância', () => {
    const urls = new Set([
      getEnemySpriteUrl('goblin_archer', 'Goblin Arqueiro', 'archer-1'),
      getEnemySpriteUrl('goblin_archer', 'Goblin Arqueiro', 'archer-2'),
    ]);
    expect(urls.size).toBe(2);
  });

  it('usa sprite dedicado para Ogro das Colinas', () => {
    const url = getEnemySpriteUrl('hill_ogre', 'Ogro das Colinas');
    expect(url).toContain('characters/ogro.png');
    expect(url).not.toContain('goblin_boss');
  });

  it('usa sprite dedicado para Rato Gigante', () => {
    const url = getEnemySpriteUrl('giant_rat', 'Rato Gigante Lv.2');
    expect(url).toContain('characters/rato_gigante.png');
  });

  it('usa sprite dedicado para Xamã Goblin', () => {
    const url = getEnemySpriteUrl('goblin_shaman', 'Xamã Goblin');
    expect(url).toContain('characters/goblin_xama.png');
  });

  it('usa saci_boss para Saci', () => {
    const url = getEnemySpriteUrl('saci', 'Saci');
    expect(url).toContain('characters/saci_boss.png');
  });

  it('usa goblin_bomber para Goblin Bombardeiro', () => {
    const url = getEnemySpriteUrl('goblin_bomber', 'Goblin Bombardeiro Lv.5');
    expect(url).toContain('characters/goblin_bomber.png');
  });

  it('usa gonodor_boss para Gonodor', () => {
    const url = getEnemySpriteUrl('gonodor', 'Gonodor');
    expect(url).toContain('characters/gonodor_boss.png');
  });

  it('usa vorax_boss para Vorax', () => {
    const url = getEnemySpriteUrl('vorax', 'Vorax');
    expect(url).toContain('characters/vorax_boss.png');
  });
});
