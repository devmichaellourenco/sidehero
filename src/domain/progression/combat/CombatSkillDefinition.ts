import { SkillId } from '../SkillId';
import { SkillCombatKind } from './SkillCombatKind';
import { SkillTargeting } from './SkillTargeting';

export type SkillTargetScope = 'single' | 'all';
export type SkillTargetPool = 'heroes' | 'enemies';
export type SkillTargetPriority =
  | 'lowest_hp'
  | 'lowest_hp_percent'
  | 'highest_hp'
  | 'highest_hp_percent';

export interface CombatSkillDefinition {
  skillId: SkillId | 'basic_attack' | string;
  kind: SkillCombatKind;
  /** Pool absoluto de alvos no combate. */
  targetPool: SkillTargetPool;
  targetScope: SkillTargetScope;
  targetPriority: SkillTargetPriority;
  /** Maior = preferida quando pronta (ataque básico = 0). */
  usePriority: number;
  /** Turnos até a primeira utilização no combate. */
  initialCooldown: number;
  /** Turnos de espera após usar a skill. */
  cooldownTurns: number;
  basePower: number;
  powerPerRank: number;
  attributeFactor: number;
  /** Usa o ATK do combatente como poder base. */
  usesAttackStat?: boolean;
  /** Cura só é elegível se algum herói aliado estiver abaixo deste % de HP. */
  healConditionThreshold?: number;
}

export function toSkillTargeting(definition: CombatSkillDefinition): SkillTargeting {
  if (definition.kind === 'heal_ally') {
    return definition.targetScope === 'all' ? 'all_allies' : 'single_ally';
  }
  if (definition.targetPool === 'heroes') {
    return definition.targetScope === 'all' ? 'all_allies' : 'single_ally';
  }
  return definition.targetScope === 'all' ? 'all_enemies' : 'single_enemy';
}
