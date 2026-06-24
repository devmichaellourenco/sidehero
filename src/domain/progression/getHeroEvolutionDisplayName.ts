import { HeroClass } from '../entities/HeroClass';
import { getKnightEvolutionDisplayName } from './KnightEvolutionCatalog';
import { getPriestEvolutionDisplayName } from './PriestEvolutionCatalog';
import { getSorcererEvolutionDisplayName } from './SorcererEvolutionCatalog';
import { AscensionId } from './SkillId';

export function getHeroEvolutionDisplayName(
  heroClass: HeroClass,
  ascensionId: AscensionId,
): string {
  if (heroClass === 'knight') return getKnightEvolutionDisplayName(ascensionId);
  if (heroClass === 'sorcerer') return getSorcererEvolutionDisplayName(ascensionId);
  if (heroClass === 'priest') return getPriestEvolutionDisplayName(ascensionId);
  return ascensionId;
}
