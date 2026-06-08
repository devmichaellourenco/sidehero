import { Hero } from '../../entities/Hero';
import { CombatAction } from './CombatAction';

export interface ICombatSkillResolver {
  resolve(hero: Hero, party: Hero[]): CombatAction;
}
