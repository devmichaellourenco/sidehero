import { getSkillById } from '../../progression/SkillCatalog';
import {
  CombatSkillDefinition,
  toSkillTargeting,
} from '../../progression/combat/CombatSkillDefinition';
import { listEnemyCombatSkills } from '../../progression/combat/EnemyCombatSkillCatalog';
import { listHeroCombatSkills } from '../../progression/combat/HeroCombatSkillCatalog';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { CombatAction } from './CombatAction';
import { SkillCooldownTracker, combatantKey } from './SkillCooldownTracker';
import { SkillPowerCalculator } from '../../progression/combat/SkillPowerCalculator';
import { SkillTargetResolver } from './SkillTargetResolver';

export interface SelectedCombatAction {
  action: CombatAction;
  skillId: string;
}

export class CombatSkillSelector {
  constructor(
    private readonly powerCalculator = new SkillPowerCalculator(),
    private readonly targetResolver = new SkillTargetResolver(),
  ) {}

  selectHeroAction(
    hero: Hero,
    party: Hero[],
    enemies: Enemy[],
    cooldowns: SkillCooldownTracker,
  ): SelectedCombatAction | null {
    if (!hero.isAlive()) return null;

    const key = combatantKey('hero', hero.id);
    const skills = listHeroCombatSkills(hero)
      .filter((skill) => cooldowns.isReady(key, skill.skillId))
      .filter((skill) => this.meetsHealCondition(skill, party))
      .sort((left, right) => right.usePriority - left.usePriority);

    for (const skill of skills) {
      const action = this.buildAction(skill, hero, party, enemies);
      if (action) return { action, skillId: skill.skillId };
    }

    return null;
  }

  selectEnemyAction(
    enemy: Enemy,
    party: Hero[],
    enemies: Enemy[],
    cooldowns: SkillCooldownTracker,
  ): SelectedCombatAction | null {
    if (!enemy.isAlive()) return null;

    const key = combatantKey('enemy', enemy.id);
    const skills = listEnemyCombatSkills(enemy)
      .filter((skill) => cooldowns.isReady(key, skill.skillId))
      .sort((left, right) => right.usePriority - left.usePriority);

    for (const skill of skills) {
      const action = this.buildAction(skill, enemy, party, enemies);
      if (action) return { action, skillId: skill.skillId };
    }

    return null;
  }

  private meetsHealCondition(skill: CombatSkillDefinition, party: Hero[]): boolean {
    if (skill.kind !== 'heal_ally' || skill.healConditionThreshold === undefined) {
      return true;
    }

    return party.some((ally) => {
      if (!ally.isAlive()) return false;
      return ally.currentHealth / ally.maxHealth < skill.healConditionThreshold!;
    });
  }

  private buildAction(
    skill: CombatSkillDefinition,
    actor: Hero | Enemy,
    party: Hero[],
    enemies: Enemy[],
  ): CombatAction | null {
    const skillName = this.resolveSkillName(skill);
    const targeting = toSkillTargeting(skill);

    if (skill.kind === 'heal_ally' || skill.targetPool === 'heroes') {
      const targetHeroIds = this.targetResolver.resolveHeroTargets(
        skill,
        party,
        actor.id,
      );
      if (targetHeroIds.length === 0) return null;

      const power =
        actor instanceof Hero
          ? this.powerCalculator.calculateForHero(skill, actor)
          : this.powerCalculator.calculateForEnemy(skill, actor as Enemy);

      if (skill.kind === 'heal_ally') {
        return {
          skillId: skill.skillId,
          skillName,
          kind: skill.kind,
          targeting,
          power,
          targetHeroId: targeting === 'single_ally' ? targetHeroIds[0] : undefined,
          targetHeroIds: targeting === 'all_allies' ? targetHeroIds : undefined,
        };
      }

      return {
        skillId: skill.skillId,
        skillName,
        kind: skill.kind,
        targeting,
        power,
        targetHeroId: targeting === 'single_ally' ? targetHeroIds[0] : undefined,
        targetHeroIds: targeting === 'all_allies' ? targetHeroIds : undefined,
      };
    }

    const targetEnemyIds = this.targetResolver.resolveEnemyTargets(skill, enemies);
    if (targetEnemyIds.length === 0) return null;

    const power =
      actor instanceof Hero
        ? this.powerCalculator.calculateForHero(skill, actor)
        : this.powerCalculator.calculateForEnemy(skill, actor as Enemy);

    return {
      skillId: skill.skillId,
      skillName,
      kind: skill.kind,
      targeting,
      power,
      targetEnemyId: targeting === 'single_enemy' ? targetEnemyIds[0] : undefined,
      targetEnemyIds: targeting === 'all_enemies' ? targetEnemyIds : undefined,
    };
  }

  private resolveSkillName(skill: CombatSkillDefinition): string {
    if (skill.skillId === 'goblin_stab') return 'Facada';
    if (skill.skillId === 'orc_smash') return 'Pancada';
    if (skill.skillId === 'wraith_drain') return 'Drenar Vida';
    if (skill.skillId === 'dragon_breath') return 'Baforada';
    if (skill.skillId === 'dragon_bite') return 'Mordida';
    return getSkillById(skill.skillId)?.name ?? skill.skillId;
  }
}
