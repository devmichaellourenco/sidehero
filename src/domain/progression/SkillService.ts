import { Hero } from '../entities/Hero';
import { calculateSkillActivationCost } from './SkillActivationRules';
import { ProgressionRequirementEvaluator } from './ProgressionRequirementEvaluator';
import { getSkillById, getSkillsForHero, SKILL_CATALOG } from './SkillCatalog';
import { SkillDefinition } from './SkillDefinition';
import { SkillId } from './SkillId';

export type SkillNodeStatus = 'locked' | 'ready' | 'owned' | 'maxed';

export interface SkillNodeView {
  definition: SkillDefinition;
  currentRank: number;
  status: SkillNodeStatus;
  isEquipped: boolean;
  activationCost: number;
  requirements: { label: string; met: boolean }[];
}

export class SkillService {
  private readonly evaluator = new ProgressionRequirementEvaluator();

  buildTree(hero: Hero): SkillNodeView[] {
    return this.buildTreeForPointType(hero, 'improvement');
  }

  buildAscensionTree(hero: Hero): SkillNodeView[] {
    const props = hero.toProps();
    if (!props.ascensionId) return [];

    return this.buildTreeForPointType(hero, 'ascension');
  }

  private buildTreeForPointType(hero: Hero, pointType: 'improvement' | 'ascension'): SkillNodeView[] {
    const props = hero.toProps();
    const skills = getSkillsForHero(hero.heroClass, props.ascensionId).filter(
      (skill) => skill.pointType === pointType,
    );

    return skills.map((definition) => {
      const currentRank = props.skillRanks[definition.id] ?? 0;
      const requirements = this.evaluator.evaluateAll(hero, definition.requirements);
      const reqsMet = requirements.every((req) => req.met);

      let status: SkillNodeStatus = 'locked';
      if (currentRank >= definition.maxRank) {
        status = 'maxed';
      } else if (currentRank > 0) {
        status = 'owned';
      } else if (reqsMet) {
        status = 'ready';
      }

      return {
        definition,
        currentRank,
        status,
        isEquipped: props.equippedSkillIds.includes(definition.id),
        activationCost: calculateSkillActivationCost(Math.max(1, currentRank + 1)),
        requirements,
      };
    });
  }

  canAllocate(hero: Hero, skillId: SkillId): boolean {
    return this.canAllocateWithPointType(hero, skillId, 'improvement');
  }

  canAllocateAscension(hero: Hero, skillId: SkillId): boolean {
    return this.canAllocateWithPointType(hero, skillId, 'ascension');
  }

  private canAllocateWithPointType(
    hero: Hero,
    skillId: SkillId,
    pointType: 'improvement' | 'ascension',
  ): boolean {
    const definition = getSkillById(skillId);
    if (!definition || definition.pointType !== pointType) return false;

    const props = hero.toProps();
    const currentRank = props.skillRanks[skillId] ?? 0;
    if (currentRank >= definition.maxRank) return false;

    const availablePoints =
      pointType === 'improvement' ? props.unspentImprovementPoints : props.unspentAscensionPoints;
    if (availablePoints < 1) return false;

    return this.evaluator.allMet(hero, definition.requirements);
  }

  allocate(hero: Hero, skillId: SkillId): Hero {
    if (!this.canAllocate(hero, skillId)) {
      throw new Error('Não é possível investir nesta skill');
    }
    return hero.spendImprovementPointOnSkill(skillId);
  }

  allocateAscension(hero: Hero, skillId: SkillId): Hero {
    if (!this.canAllocateAscension(hero, skillId)) {
      throw new Error('Não é possível investir nesta skill de ascensão');
    }
    return hero.spendAscensionPointOnSkill(skillId);
  }

  canActivate(hero: Hero, skillId: SkillId): boolean {
    return (hero.toProps().skillRanks[skillId] ?? 0) >= 1;
  }

  activate(hero: Hero, skillId: SkillId): Hero {
    if (!this.canActivate(hero, skillId)) {
      throw new Error('Skill não desbloqueada');
    }
    return hero.activateSkill(skillId);
  }

  deactivate(hero: Hero, skillId: SkillId): Hero {
    return hero.deactivateSkill(skillId);
  }

  getActivationCost(hero: Hero, skillId: SkillId): number {
    const rank = (hero.toProps().skillRanks[skillId] ?? 0) + 1;
    return calculateSkillActivationCost(Math.max(1, rank));
  }

  listCatalog(): SkillDefinition[] {
    return [...SKILL_CATALOG];
  }
}
