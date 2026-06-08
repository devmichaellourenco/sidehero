import { SkillId } from '../../progression/SkillId';

export type CombatActionKind = 'heal_ally' | 'damage_magic' | 'damage_physical' | 'basic_attack';

export interface CombatAction {
  kind: CombatActionKind;
  skillId?: SkillId;
  skillName?: string;
  power: number;
  targetHeroId?: string;
}

export function createBasicAttack(power: number): CombatAction {
  return { kind: 'basic_attack', power };
}
