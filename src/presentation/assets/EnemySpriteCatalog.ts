/**
 * Sprites dedicados por id do roster.
 * Valor = basename do PNG em public/sprites/enemies (copiado para characters/).
 */
const ENEMY_SPRITE_FILES: Record<string, string> = {
  giant_rat: 'rato_gigante',
  gray_wolf: 'lobo_cinzento',
  hill_ogre: 'ogro',
  lizardman: 'homem_lagarto_guerreiro',
  skeleton_warrior: 'rato_esqueleto_guerreiro',
  minor_fire_elemental: 'elemental_menor_do_fogo',
  gargoyle: 'gargula',
  goblin_shaman: 'goblin_xama',
  bandit_captain: 'goblin_xama_chefe',
  three_head_hydra: 'hidra',
  young_green_dragon: 'dragao_verde',
  goblin_raider: 'goblin_left',
  renegade_necromancer: 'denver',
  rot_zombie: 'rot_zombie',
  cultist_mage: 'cultist_mage',
  major_elemental: 'major_elemental',
  dead_general: 'dead_general',
  stone_giant: 'stone_giant',
  frost_giant: 'frost_giant',
  manticore: 'manticore',
  lesser_lich: 'lesser_lich',
  archlich: 'archlich',
  saci: 'saci_boss',
  gonodor: 'gonodor_boss',
  vorax: 'vorax_final_boss',
};

export function resolveEnemyDedicatedSpritePath(enemyType: string): string | null {
  const file = ENEMY_SPRITE_FILES[enemyType];
  if (!file) return null;
  return `characters/${file}.png`;
}

export function listEnemyDedicatedSpriteTypes(): string[] {
  return Object.keys(ENEMY_SPRITE_FILES);
}
