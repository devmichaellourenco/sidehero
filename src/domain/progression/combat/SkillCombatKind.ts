export type SkillCombatKind =
  | 'heal_ally'
  | 'damage_magic'
  | 'damage_physical'
  | 'buff_attack'
  | 'debuff_defense';

export function isStatusCombatKind(kind: SkillCombatKind): boolean {
  return kind === 'buff_attack' || kind === 'debuff_defense';
}
