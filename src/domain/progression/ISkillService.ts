import { Hero } from '../entities/Hero';
import { SkillId } from './SkillId';
import type { SkillNodeView } from './SkillService';

export interface ISkillService {
  buildTree(hero: Hero, unlockedBattleSkillSlots: number): SkillNodeView[];
  buildAscensionTree(hero: Hero, unlockedBattleSkillSlots: number): SkillNodeView[];
  allocate(hero: Hero, skillId: SkillId): Hero;
  allocateAscension(hero: Hero, skillId: SkillId): Hero;
  activate(hero: Hero, skillId: SkillId, unlockedBattleSkillSlots: number): Hero;
  deactivate(hero: Hero, skillId: SkillId): Hero;
  getActivationCost(hero: Hero, skillId: SkillId): number;
}
