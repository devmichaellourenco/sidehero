import { resolveCombatSkillName } from '../../progression/combat/CombatSkillNaming';
import { CombatSkillDefinition } from '../../progression/combat/CombatSkillDefinition';
import { listEnemyCombatSkills } from '../../progression/combat/EnemyCombatSkillCatalog';
import { listHeroCombatSkills } from '../../progression/combat/HeroCombatSkillCatalog';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { CombatSkillIntent } from './CombatSkillIntent';
import { CombatSkillSelector } from './CombatSkillSelector';
import { SkillCooldownTracker, combatantKey } from './SkillCooldownTracker';

export class CombatSkillIntentResolver {
  constructor(private readonly selector = new CombatSkillSelector()) {}

  resolveForHero(
    hero: Hero,
    party: Hero[],
    enemies: Enemy[],
    cooldowns: SkillCooldownTracker,
  ): CombatSkillIntent | null {
    if (!hero.isAlive()) return null;

    const key = combatantKey('hero', hero.id);
    const skills = listHeroCombatSkills(hero);
    const selected = this.selector.selectHeroAction(hero, party, enemies, cooldowns);
    if (!selected) return null;

    return this.buildIntent(key, skills, selected.skillId, selected.action.skillName, cooldowns);
  }

  resolveForEnemy(
    enemy: Enemy,
    party: Hero[],
    enemies: Enemy[],
    cooldowns: SkillCooldownTracker,
  ): CombatSkillIntent | null {
    if (!enemy.isAlive()) return null;

    const key = combatantKey('enemy', enemy.id);
    const skills = listEnemyCombatSkills(enemy);
    const selected = this.selector.selectEnemyAction(enemy, party, enemies, cooldowns);
    if (!selected) return null;

    return this.buildIntent(key, skills, selected.skillId, selected.action.skillName, cooldowns);
  }

  private buildIntent(
    key: string,
    skills: CombatSkillDefinition[],
    nextSkillId: string,
    nextSkillName: string,
    cooldowns: SkillCooldownTracker,
  ): CombatSkillIntent {
    const chargingSkills = this.listChargingSkills(key, skills, cooldowns, nextSkillId);

    return {
      nextSkillName,
      nextSkillId,
      status: 'ready',
      turnsRemaining: 0,
      chargingSkills,
    };
  }

  private listChargingSkills(
    key: string,
    skills: CombatSkillDefinition[],
    cooldowns: SkillCooldownTracker,
    nextSkillId: string,
  ): Array<{ skillName: string; turnsRemaining: number }> {
    return skills
      .filter((skill) => skill.skillId !== nextSkillId)
      .map((skill) => ({
        skillName: resolveCombatSkillName(skill),
        turnsRemaining: cooldowns.getRemaining(key, skill.skillId),
      }))
      .filter((entry) => entry.turnsRemaining > 0)
      .sort((left, right) => left.turnsRemaining - right.turnsRemaining);
  }
}
