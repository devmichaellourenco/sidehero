import { HeroClass } from '../entities/HeroClass';
import { ClassAscension } from './ClassAscension';
import { AscensionId } from './SkillId';

export const CLASS_ASCENSION_CATALOG: ClassAscension[] = [
  {
    id: 'knight_guardian',
    heroClass: 'knight',
    name: 'Guardião',
    description: 'Especialização defensiva — protege aliados e resiste ao dano.',
    requirements: [
      { type: 'hero_level', min: 10 },
      { type: 'attribute', key: 'str', min: 14 },
    ],
    pointsGranted: 2,
  },
  {
    id: 'knight_reaver',
    heroClass: 'knight',
    name: 'Devastador',
    description: 'Especialização ofensiva — golpes brutais e pressão constante.',
    requirements: [
      { type: 'hero_level', min: 10 },
      { type: 'attribute', key: 'str', min: 14 },
      { type: 'attribute', key: 'dex', min: 10 },
    ],
    pointsGranted: 2,
  },
  {
    id: 'sorcerer_pyromancer',
    heroClass: 'sorcerer',
    name: 'Piromante',
    description: 'Domínio do fogo — magias incendiárias devastadoras.',
    requirements: [
      { type: 'hero_level', min: 10 },
      { type: 'attribute', key: 'int', min: 14 },
    ],
    pointsGranted: 2,
  },
  {
    id: 'sorcerer_arcanist',
    heroClass: 'sorcerer',
    name: 'Arcanista',
    description: 'Maestria arcana — rajadas de energia pura.',
    requirements: [
      { type: 'hero_level', min: 10 },
      { type: 'attribute', key: 'int', min: 14 },
      { type: 'attribute', key: 'dex', min: 10 },
    ],
    pointsGranted: 2,
  },
  {
    id: 'priest_oracle',
    heroClass: 'priest',
    name: 'Oráculo',
    description: 'Cura avançada e suporte sagrado à party.',
    requirements: [
      { type: 'hero_level', min: 10 },
      { type: 'attribute', key: 'int', min: 14 },
    ],
    pointsGranted: 2,
  },
  {
    id: 'priest_inquisitor',
    heroClass: 'priest',
    name: 'Inquisidor',
    description: 'Castigo divino — dano sagrado ao inimigo.',
    requirements: [
      { type: 'hero_level', min: 10 },
      { type: 'attribute', key: 'int', min: 14 },
      { type: 'attribute', key: 'str', min: 10 },
    ],
    pointsGranted: 2,
  },
];

const ascensionMap = new Map<AscensionId, ClassAscension>(
  CLASS_ASCENSION_CATALOG.map((entry) => [entry.id, entry]),
);

export function getAscensionById(ascensionId: AscensionId): ClassAscension | undefined {
  return ascensionMap.get(ascensionId);
}

export function getAscensionsForClass(heroClass: HeroClass): ClassAscension[] {
  return CLASS_ASCENSION_CATALOG.filter((entry) => entry.heroClass === heroClass);
}
