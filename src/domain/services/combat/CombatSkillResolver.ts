import { getSkillById } from '../../progression/SkillCatalog';
import { listCombatProfilesForEquipped } from '../../progression/combat/SkillCombatCatalog';
import { SkillPowerCalculator } from '../../progression/combat/SkillPowerCalculator';
import { Hero } from '../../entities/Hero';
import { CombatAction, createBasicAttack } from './CombatAction';
import { ICombatSkillResolver } from './ICombatSkillResolver';

export class CombatSkillResolver implements ICombatSkillResolver {
  constructor(private readonly powerCalculator = new SkillPowerCalculator()) {}

  resolve(hero: Hero, party: Hero[]): CombatAction {
    if (!hero.isAlive()) {
      return createBasicAttack(0);
    }

    const props = hero.toProps();
    const profiles = listCombatProfilesForEquipped(props.equippedSkillIds);

    for (const profile of profiles) {
      const rank = props.skillRanks[profile.skillId] ?? 0;
      if (rank < 1) continue;

      const definition = getSkillById(profile.skillId);
      if (!definition) continue;

      if (profile.kind === 'heal_ally') {
        const target = this.findHealTarget(party, profile.healThreshold ?? 0.85);
        if (!target) continue;

        return {
          kind: 'heal_ally',
          skillId: profile.skillId,
          skillName: definition.name,
          power: this.powerCalculator.calculate(profile, rank, hero),
          targetHeroId: target.id,
        };
      }

      const power = this.powerCalculator.calculate(profile, rank, hero);
      return {
        kind: profile.kind,
        skillId: profile.skillId,
        skillName: definition.name,
        power,
      };
    }

    return createBasicAttack(hero.attack);
  }

  private findHealTarget(party: Hero[], threshold: number): Hero | null {
    let best: Hero | null = null;
    let lowestRatio = threshold;

    for (const ally of party) {
      if (!ally.isAlive()) continue;
      const ratio = ally.currentHealth / ally.maxHealth;
      if (ratio < lowestRatio) {
        lowestRatio = ratio;
        best = ally;
      }
    }

    return best;
  }
}
