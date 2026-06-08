import { Hero } from '../entities/Hero';
import { ClassAscension } from './ClassAscension';
import {
  getAscensionById,
  getAscensionsForClass,
} from './ClassAscensionCatalog';
import { HeroRequirementEvaluator } from '../requirements/HeroRequirementEvaluator';
import { IClassAscensionService } from './IClassAscensionService';
import { AscensionId } from './SkillId';

export interface AscensionOptionView {
  definition: ClassAscension;
  requirements: { label: string; met: boolean }[];
  canAscend: boolean;
}

export class ClassAscensionService implements IClassAscensionService {
  private readonly evaluator = new HeroRequirementEvaluator();

  listOptions(hero: Hero): AscensionOptionView[] {
    const alreadyAscended = hero.toProps().ascensionId !== null;

    return getAscensionsForClass(hero.heroClass).map((definition) => {
      const requirements = this.evaluator.evaluateAll(hero, definition.requirements);
      const reqsMet = requirements.every((req) => req.met);

      return {
        definition,
        requirements,
        canAscend: !alreadyAscended && reqsMet,
      };
    });
  }

  canAscend(hero: Hero, ascensionId: AscensionId): boolean {
    if (hero.toProps().ascensionId !== null) return false;

    const definition = getAscensionById(ascensionId);
    if (!definition || definition.heroClass !== hero.heroClass) return false;

    return this.evaluator.allMet(hero, definition.requirements);
  }

  ascend(hero: Hero, ascensionId: AscensionId): Hero {
    if (!this.canAscend(hero, ascensionId)) {
      throw new Error('Requisitos de ascensão não atendidos');
    }

    const definition = getAscensionById(ascensionId);
    if (!definition) {
      throw new Error('Ascensão inválida');
    }

    return hero.ascend(ascensionId, definition.pointsGranted);
  }
}
