import { Hero } from '../../entities/Hero';
import { getSkillById } from '../SkillCatalog';
import { SkillCombatProfile } from './SkillCombatProfile';

export class SkillPowerCalculator {
  calculate(profile: SkillCombatProfile, rank: number, hero: Hero): number {
    const definition = getSkillById(profile.skillId);
    const scalingKey = definition?.scaling ?? 'int';
    const attributeValue = hero.totalAttributes[scalingKey];

    const raw =
      profile.basePower +
      profile.powerPerRank * Math.max(0, rank - 1) +
      attributeValue * profile.attributeFactor;

    return Math.max(1, Math.floor(raw));
  }
}
