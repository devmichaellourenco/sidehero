import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { applyEnemyDamageSkillPower } from '../../combat/EnemyCombatBalance';
import { BASIC_ATTACK_DAMAGE_RATIO } from '../../combat/CombatTimingConstants';
import { getSkillById } from '../SkillCatalog';
import { CombatSkillDefinition } from './CombatSkillDefinition';
import {
  applyHeroDamageSkillPower,
  calculateHeroSkillRawPower,
} from './SkillDamageBalance';
import { resolveEffectiveAttack } from '../../services/combat/CombatStatResolver';
import { CombatStatusEffectTracker } from '../../services/combat/CombatStatusEffectTracker';
import {
  applyPercentBonus,
  heroPassiveAllySupportPercent,
  heroPassiveTreeDamagePercent,
} from '../../passives/PassiveModifiers';

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
      return Math.max(1, Math.floor(effectiveAttack * BASIC_ATTACK_DAMAGE_RATIO));
    }

    const rank = hero.toProps().skillRanks[skill.skillId] ?? 1;
    const definition = getSkillById(skill.skillId);
    const scalingKey = definition?.scaling ?? 'int';
    const attributeValue = hero.totalAttributes[scalingKey];

    const raw = calculateHeroSkillRawPower(skill, rank, attributeValue);
    let power = applyHeroDamageSkillPower(skill, raw, effectiveAttack);
    power = applyPercentBonus(power, heroPassiveTreeDamagePercent(hero, skill));
    power = applyPercentBonus(power, heroPassiveAllySupportPercent(hero, skill));
    return power;
  }

  calculateForEnemy(skill: CombatSkillDefinition, enemy: Enemy): number {
    if (skill.usesAttackStat) {
      return Math.max(1, enemy.stats.attack);
    }

    const raw = skill.basePower + enemy.stage;
    return applyEnemyDamageSkillPower(skill, raw, enemy.stats.attack);
  }
}
