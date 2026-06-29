import { describe, expect, it } from 'vitest';
import { resolveEnemyDedicatedSpritePath } from './EnemySpriteCatalog';

describe('EnemySpriteCatalog', () => {
  it('mapeia os 11 inimigos com sprite dedicado', () => {
    expect(resolveEnemyDedicatedSpritePath('giant_rat')).toBe('characters/rato_gigante.png');
    expect(resolveEnemyDedicatedSpritePath('gray_wolf')).toBe('characters/lobo_cinzento.png');
    expect(resolveEnemyDedicatedSpritePath('hill_ogre')).toBe('characters/ogro.png');
    expect(resolveEnemyDedicatedSpritePath('lizardman')).toBe('characters/homem_lagarto_guerreiro.png');
    expect(resolveEnemyDedicatedSpritePath('skeleton_warrior')).toBe(
      'characters/rato_esqueleto_guerreiro.png',
    );
    expect(resolveEnemyDedicatedSpritePath('minor_fire_elemental')).toBe(
      'characters/elemental_menor_do_fogo.png',
    );
    expect(resolveEnemyDedicatedSpritePath('gargoyle')).toBe('characters/gargula.png');
    expect(resolveEnemyDedicatedSpritePath('goblin_shaman')).toBe('characters/goblin_xama.png');
    expect(resolveEnemyDedicatedSpritePath('bandit_captain')).toBe('characters/goblin_xama_chefe.png');
    expect(resolveEnemyDedicatedSpritePath('three_head_hydra')).toBe('characters/hidra.png');
    expect(resolveEnemyDedicatedSpritePath('young_green_dragon')).toBe('characters/dragao_verde.png');
  });

  it('retorna null para inimigos sem sprite dedicado', () => {
    expect(resolveEnemyDedicatedSpritePath('goblin_raider')).toBeNull();
  });
});
