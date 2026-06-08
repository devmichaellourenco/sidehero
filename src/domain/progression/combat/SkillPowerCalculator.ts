import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { getSkillById } from '../SkillCatalog';
import { CombatSkillDefinition } from './CombatSkillDefinition';

export class SkillPowerCalculator {
  calculateForHero(skill: CombatSkillDefinition, hero: Hero): number {
    if (skill.usesAttackStat) {
      return Math.max(1, hero.attack);
    }

    const rank = hero.toProps().skillRanks[skill.skillId] ?? 1;
    const definition = getSkillById(skill.skillId);
    const scalingKey = definition?.scaling ?? 'int';
    const attributeValue = hero.totalAttributes[scalingKey];

    const raw =
      skill.basePower +
      skill.powerPerRank * Math.max(0, rank - 1) +
      attributeValue * skill.attributeFactor;

    return Math.max(1, Math.floor(raw));
  }

  calculateForEnemy(skill: CombatSkillDefinition, enemy: Enemy): number {
    if (skill.usesAttackStat) {
      return Math.max(1, enemy.stats.attack);
    }

    return Math.max(1, Math.floor(skill.basePower + enemy.stage));
  }
}
