import { SkillDefinition } from './SkillDefinition';

export const SKILL_CATALOG: SkillDefinition[] = [
  // Universais
  {
    id: 'power_attack',
    scope: 'universal',
    branch: 'offense',
    name: 'Ataque Poderoso',
    description: 'Dano físico extra baseado em STR.',
    maxRank: 3,
    requirements: [{ type: 'hero_level', min: 2 }, { type: 'attribute', key: 'str', min: 8 }],
    scaling: 'str',
    pointType: 'improvement',
  },
  {
    id: 'evasion',
    scope: 'universal',
    branch: 'defense',
    name: 'Esquiva',
    description: 'Aumenta defesa com DEX.',
    maxRank: 3,
    requirements: [{ type: 'hero_level', min: 2 }, { type: 'attribute', key: 'dex', min: 8 }],
    scaling: 'dex',
    pointType: 'improvement',
  },
  {
    id: 'arcane_touch',
    scope: 'universal',
    branch: 'offense',
    name: 'Toque Arcano',
    description: 'Dano mágico leve baseado em INT.',
    maxRank: 3,
    requirements: [{ type: 'hero_level', min: 2 }, { type: 'attribute', key: 'int', min: 8 }],
    scaling: 'int',
    pointType: 'improvement',
  },
  {
    id: 'vitality',
    scope: 'universal',
    branch: 'defense',
    name: 'Vitalidade',
    description: 'Mais HP com STR.',
    maxRank: 2,
    requirements: [{ type: 'hero_level', min: 4 }, { type: 'attribute', key: 'str', min: 10 }],
    scaling: 'str',
    pointType: 'improvement',
  },
  // Knight
  {
    id: 'shield_bash',
    scope: 'class',
    heroClass: 'knight',
    branch: 'offense',
    name: 'Investida',
    description: 'Golpe pesado do cavaleiro.',
    maxRank: 3,
    requirements: [{ type: 'hero_class', heroClass: 'knight' }, { type: 'hero_level', min: 3 }],
    scaling: 'str',
    pointType: 'improvement',
  },
  {
    id: 'iron_skin',
    scope: 'class',
    heroClass: 'knight',
    branch: 'defense',
    name: 'Pele de Ferro',
    description: 'Reduz dano recebido.',
    maxRank: 3,
    requirements: [
      { type: 'hero_class', heroClass: 'knight' },
      { type: 'skill_rank', skillId: 'shield_bash', minRank: 1 },
    ],
    scaling: 'str',
    pointType: 'improvement',
  },
  // Sorcerer
  {
    id: 'arcane_bolt',
    scope: 'class',
    heroClass: 'sorcerer',
    branch: 'offense',
    name: 'Raio Arcano',
    description: 'Magia básica de dano.',
    maxRank: 3,
    requirements: [{ type: 'hero_class', heroClass: 'sorcerer' }, { type: 'hero_level', min: 2 }],
    scaling: 'int',
    pointType: 'improvement',
  },
  {
    id: 'fireball',
    scope: 'class',
    heroClass: 'sorcerer',
    branch: 'offense',
    name: 'Bola de Fogo',
    description: 'Magia de fogo devastadora.',
    maxRank: 3,
    requirements: [
      { type: 'hero_class', heroClass: 'sorcerer' },
      { type: 'skill_rank', skillId: 'arcane_bolt', minRank: 1 },
      { type: 'attribute', key: 'int', min: 12 },
    ],
    scaling: 'int',
    pointType: 'improvement',
  },
  {
    id: 'mana_shield',
    scope: 'class',
    heroClass: 'sorcerer',
    branch: 'defense',
    name: 'Escudo de Mana',
    description: 'Absorve parte do dano.',
    maxRank: 2,
    requirements: [
      { type: 'hero_class', heroClass: 'sorcerer' },
      { type: 'attribute', key: 'int', min: 10 },
    ],
    scaling: 'int',
    pointType: 'improvement',
  },
  // Priest
  {
    id: 'minor_heal',
    scope: 'class',
    heroClass: 'priest',
    branch: 'utility',
    name: 'Cura Menor',
    description: 'Cura o aliado mais ferido.',
    maxRank: 3,
    requirements: [{ type: 'hero_class', heroClass: 'priest' }, { type: 'hero_level', min: 2 }],
    scaling: 'int',
    pointType: 'improvement',
  },
  {
    id: 'blessing',
    scope: 'class',
    heroClass: 'priest',
    branch: 'utility',
    name: 'Bênção',
    description: 'Fortalece a party.',
    maxRank: 2,
    requirements: [
      { type: 'hero_class', heroClass: 'priest' },
      { type: 'skill_rank', skillId: 'minor_heal', minRank: 1 },
    ],
    scaling: 'int',
    pointType: 'improvement',
  },
  {
    id: 'smite',
    scope: 'class',
    heroClass: 'priest',
    branch: 'offense',
    name: 'Castigo',
    description: 'Dano sagrado ao inimigo.',
    maxRank: 3,
    requirements: [
      { type: 'hero_class', heroClass: 'priest' },
      { type: 'attribute', key: 'int', min: 10 },
    ],
    scaling: 'int',
    pointType: 'improvement',
  },
];

export function getSkillById(skillId: string): SkillDefinition | undefined {
  return SKILL_CATALOG.find((skill) => skill.id === skillId);
}

export function getSkillsForHero(heroClass: string, ascensionId: string | null): SkillDefinition[] {
  return SKILL_CATALOG.filter((skill) => {
    if (skill.scope === 'universal') return true;
    if (skill.scope === 'class' && skill.heroClass === heroClass) return true;
    if (skill.pointType === 'ascension' && ascensionId) return true;
    return false;
  });
}
