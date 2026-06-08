import { SkillTargeting } from '../../progression/combat/SkillTargeting';
import { SkillCombatKind } from '../../progression/combat/SkillCombatKind';

export interface CombatAction {
  skillId: string;
  skillName: string;
  kind: SkillCombatKind;
  targeting: SkillTargeting;
  power: number;
  targetHeroId?: string;
  targetHeroIds?: string[];
  targetEnemyId?: string;
  targetEnemyIds?: string[];
}
