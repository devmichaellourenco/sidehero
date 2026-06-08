import { SkillId } from '../SkillId';
import { SkillCombatKind } from './SkillCombatKind';

export interface SkillCombatProfile {
  skillId: SkillId;
  kind: SkillCombatKind;
  /** Maior = avaliado antes (cura tem prioridade sobre dano). */
  priority: number;
  basePower: number;
  powerPerRank: number;
  attributeFactor: number;
  /** Só para heal: aliado com HP% abaixo disso dispara a skill. */
  healThreshold?: number;
}
