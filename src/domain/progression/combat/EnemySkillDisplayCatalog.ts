export interface EnemySkillDisplay {
  skillId: string;
  name: string;
  description: string;
}

const ENEMY_SKILL_DISPLAY: Record<string, EnemySkillDisplay> = {
  slime_acid: {
    skillId: 'slime_acid',
    name: 'Ácido',
    description: 'Corrói o herói mais ferido com dano mágico fixo.',
  },
  goblin_stab: {
    skillId: 'goblin_stab',
    name: 'Facada',
    description: 'Golpe traiçoeiro com dano extra além do ATK.',
  },
  orc_smash: {
    skillId: 'orc_smash',
    name: 'Pancada',
    description: 'Golpe pesado no alvo mais vulnerável.',
  },
  wraith_drain: {
    skillId: 'wraith_drain',
    name: 'Drenar Vida',
    description: 'Dreno mágico que foca o herói com menos vida.',
  },
  dragon_breath: {
    skillId: 'dragon_breath',
    name: 'Baforada',
    description: 'Fogo em área que atinge todo o grupo de heróis.',
  },
  dragon_bite: {
    skillId: 'dragon_bite',
    name: 'Mordida',
    description: 'Mordida devastadora no herói mais resistente.',
  },
};

export function getEnemySkillDisplay(skillId: string): EnemySkillDisplay | null {
  return ENEMY_SKILL_DISPLAY[skillId] ?? null;
}

export function listEnemySkillDisplays(skillIds: string[]): EnemySkillDisplay[] {
  return skillIds
    .map((skillId) => getEnemySkillDisplay(skillId))
    .filter((entry): entry is EnemySkillDisplay => entry !== null);
}
