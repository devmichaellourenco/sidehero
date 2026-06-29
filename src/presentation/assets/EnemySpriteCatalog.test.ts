import { describe, expect, it } from 'vitest';
import { listEnemyDedicatedSpriteTypes, resolveEnemyDedicatedSpritePath } from './EnemySpriteCatalog';

describe('EnemySpriteCatalog', () => {
  it('mapeia inimigos com alias PT ou arquivo dedicado', () => {
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
    expect(resolveEnemyDedicatedSpritePath('goblin_raider')).toBe('characters/goblin_left.png');
    expect(resolveEnemyDedicatedSpritePath('renegade_necromancer')).toBe('characters/denver.png');
  });

  it('mapeia inimigos cujo id coincide com o arquivo', () => {
    expect(resolveEnemyDedicatedSpritePath('rot_zombie')).toBe('characters/rot_zombie.png');
    expect(resolveEnemyDedicatedSpritePath('cultist_mage')).toBe('characters/cultist_mage.png');
    expect(resolveEnemyDedicatedSpritePath('major_elemental')).toBe('characters/major_elemental.png');
    expect(resolveEnemyDedicatedSpritePath('dead_general')).toBe('characters/dead_general.png');
    expect(resolveEnemyDedicatedSpritePath('stone_giant')).toBe('characters/stone_giant.png');
    expect(resolveEnemyDedicatedSpritePath('frost_giant')).toBe('characters/frost_giant.png');
    expect(resolveEnemyDedicatedSpritePath('manticore')).toBe('characters/manticore.png');
    expect(resolveEnemyDedicatedSpritePath('lesser_lich')).toBe('characters/lesser_lich.png');
    expect(resolveEnemyDedicatedSpritePath('archlich')).toBe('characters/archlich.png');
  });

  it('mapeia bosses narrativos', () => {
    expect(resolveEnemyDedicatedSpritePath('saci')).toBe('characters/saci_boss.png');
    expect(resolveEnemyDedicatedSpritePath('gonodor')).toBe('characters/gonodor_boss.png');
    expect(resolveEnemyDedicatedSpritePath('vorax')).toBe('characters/vorax_final_boss.png');
  });

  it('retorna null para inimigos sem sprite dedicado', () => {
    expect(resolveEnemyDedicatedSpritePath('goblin_archer')).toBeNull();
    expect(resolveEnemyDedicatedSpritePath('orc_warrior')).toBeNull();
  });

  it('expõe lista de ids mapeados', () => {
    expect(listEnemyDedicatedSpriteTypes().length).toBeGreaterThanOrEqual(24);
  });
});
