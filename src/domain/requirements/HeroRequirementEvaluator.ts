import { Hero } from '../entities/Hero';
import { ProgressionRequirement } from '../progression/ProgressionRequirement';
import { EvaluatedRequirement } from './EvaluatedRequirement';

export class HeroRequirementEvaluator {
  evaluateAll(hero: Hero, requirements: ProgressionRequirement[]): EvaluatedRequirement[] {
    return requirements.map((req) => ({
      label: this.describe(req),
      met: this.isMet(hero, req),
    }));
  }

  allMet(hero: Hero, requirements: ProgressionRequirement[]): boolean {
    return requirements.every((req) => this.isMet(hero, req));
  }

  isMet(hero: Hero, requirement: ProgressionRequirement): boolean {
    switch (requirement.type) {
      case 'hero_level':
        return hero.level >= requirement.min;
      case 'attribute':
        return hero.totalAttributes[requirement.key] >= requirement.min;
      case 'skill_rank':
        return (hero.toProps().skillRanks[requirement.skillId] ?? 0) >= requirement.minRank;
      case 'hero_class':
        return hero.heroClass === requirement.heroClass;
      case 'ascension':
        return hero.toProps().ascensionId === requirement.ascensionId;
      default:
        return false;
    }
  }

  private describe(requirement: ProgressionRequirement): string {
    switch (requirement.type) {
      case 'hero_level':
        return `Level ${requirement.min}`;
      case 'attribute':
        return `${requirement.key.toUpperCase()} ${requirement.min}`;
      case 'skill_rank':
        return `Skill ${requirement.skillId} rank ${requirement.minRank}`;
      case 'hero_class':
        return `Classe ${requirement.heroClass}`;
      case 'ascension':
        return `Ascensão ${requirement.ascensionId}`;
      default:
        return 'Requisito';
    }
  }
}
