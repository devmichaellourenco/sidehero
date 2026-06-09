import { Hero } from '../entities/Hero';
import { calculateSkillActivationCost } from './SkillActivationRules';
import { HeroRequirementEvaluator } from '../requirements/HeroRequirementEvaluator';
import { ISkillService } from './ISkillService';
import { BASIC_ATTACK_SKILL_ID } from './combat/BasicAttackSkill';
import { hasFreeBattleSkillSlot, MAX_ACTIVE_BATTLE_SKILLS } from './SkillBattleSlots';
import { getSkillById, getSkillsForHero, SKILL_CATALOG } from './SkillCatalog';
import { SkillDefinition } from './SkillDefinition';
import { SkillId } from './SkillId';

export type SkillNodeStatus = 'locked' | 'ready' | 'owned' | 'maxed';

export interface SkillNodeView {
  definition: SkillDefinition;
  currentRank: number;
  status: SkillNodeStatus;
  isEquipped: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  activationCost: number;
  requirements: { label: string; met: boolean }[];
}

export class SkillService implements ISkillService {
  private readonly evaluator = new HeroRequirementEvaluator();

  buildTree(hero: Hero, unlockedBattleSkillSlots: number): SkillNodeView[] {
    return this.buildTreeForPointType(hero, 'improvement', unlockedBattleSkillSlots);
  }

  buildAscensionTree(hero: Hero, unlockedBattleSkillSlots: number): SkillNodeView[] {
    const props = hero.toProps();
    if (!props.ascensionId) return [];

    return this.buildTreeForPointType(hero, 'ascension', unlockedBattleSkillSlots);
  }

  private buildTreeForPointType(
    hero: Hero,
    pointType: 'improvement' | 'ascension',
    unlockedBattleSkillSlots: number,
  ): SkillNodeView[] {
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

      const isEquipped = props.equippedSkillIds.includes(definition.id);

      return {
        definition,
        currentRank,
        status,
        isEquipped,
        canActivate:
          definition.id !== BASIC_ATTACK_SKILL_ID &&
          currentRank > 0 &&
          !isEquipped &&
          hasFreeBattleSkillSlot(props.equippedSkillIds, unlockedBattleSkillSlots),
        canDeactivate: isEquipped && definition.id !== BASIC_ATTACK_SKILL_ID,
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

  canActivate(hero: Hero, skillId: SkillId, unlockedBattleSkillSlots: number): boolean {
    if (skillId === BASIC_ATTACK_SKILL_ID) return false;

    const props = hero.toProps();
    if ((props.skillRanks[skillId] ?? 0) < 1) return false;
    if (props.equippedSkillIds.includes(skillId)) return false;
    return hasFreeBattleSkillSlot(props.equippedSkillIds, unlockedBattleSkillSlots);
  }

  canDeactivate(hero: Hero, skillId: SkillId): boolean {
    if (skillId === BASIC_ATTACK_SKILL_ID) return false;
    return hero.toProps().equippedSkillIds.includes(skillId);
  }

  activate(hero: Hero, skillId: SkillId, unlockedBattleSkillSlots: number): Hero {
    if (!this.canActivate(hero, skillId, unlockedBattleSkillSlots)) {
      throw new Error('Skill não desbloqueada');
    }
    const slotLimit = Math.max(1, Math.min(MAX_ACTIVE_BATTLE_SKILLS, unlockedBattleSkillSlots));
    return hero.activateSkill(skillId, slotLimit);
  }

  deactivate(hero: Hero, skillId: SkillId): Hero {
    if (!this.canDeactivate(hero, skillId)) {
      throw new Error('Esta skill não pode ser desativada');
    }
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
