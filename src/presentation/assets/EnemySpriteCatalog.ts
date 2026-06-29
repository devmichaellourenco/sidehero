/** Sprites dedicados por id do roster (public/sprites/enemies → characters/). */
const ENEMY_DEDICATED_SPRITES: Record<string, string> = {
  giant_rat: 'characters/rato_gigante.png',
  gray_wolf: 'characters/lobo_cinzento.png',
  hill_ogre: 'characters/ogro.png',
  lizardman: 'characters/homem_lagarto_guerreiro.png',
  skeleton_warrior: 'characters/rato_esqueleto_guerreiro.png',
  minor_fire_elemental: 'characters/elemental_menor_do_fogo.png',
  gargoyle: 'characters/gargula.png',
  goblin_shaman: 'characters/goblin_xama.png',
  bandit_captain: 'characters/goblin_xama_chefe.png',
  three_head_hydra: 'characters/hidra.png',
  young_green_dragon: 'characters/dragao_verde.png',
};

export function resolveEnemyDedicatedSpritePath(enemyType: string): string | null {
  return ENEMY_DEDICATED_SPRITES[enemyType] ?? null;
}
