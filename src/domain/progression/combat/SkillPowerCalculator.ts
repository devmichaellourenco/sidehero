import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { applyEnemyDamageSkillPower } from '../../combat/EnemyCombatBalance';
import { getSkillById } from '../SkillCatalog';
import { CombatSkillDefinition } from './CombatSkillDefinition';
import { applyHeroDamageSkillPower } from './SkillDamageBalance';
import { resolveEffectiveAttack } from '../../services/combat/CombatStatResolver';
import { CombatStatusEffectTracker } from '../../services/combat/CombatStatusEffectTracker';

export class SkillPowerCalculator {
  calculateForHero(
    skill: CombatSkillDefinition,
    hero: Hero,
    statusEffects: CombatStatusEffectTracker = CombatStatusEffectTracker.fromMap({}),
    combatantKey?: string,
  ): number {
    const key = combatantKey ?? `hero:${hero.id}`;
    const effectiveAttack = resolveEffectiveAttack(hero.attack, key, statusEffects);

    if (skill.usesAttackStat) {
      return effectiveAttack;
    }

    const rank = hero.toProps().skillRanks[skill.skillId] ?? 1;
    const definition = getSkillById(skill.skillId);
    const scalingKey = definition?.scaling ?? 'int';
    const attributeValue = hero.totalAttributes[scalingKey];

    const raw =
      skill.basePower +
      skill.powerPerRank * Math.max(0, rank - 1) +
      attributeValue * skill.attributeFactor;

    return applyHeroDamageSkillPower(skill, raw, effectiveAttack);
  }

  calculateForEnemy(skill: CombatSkillDefinition, enemy: Enemy): number {
    if (skill.usesAttackStat) {
      return Math.max(1, enemy.stats.attack);
    }

    const raw = skill.basePower + enemy.stage;
    return applyEnemyDamageSkillPower(skill, raw, enemy.stats.attack);
  }
}
