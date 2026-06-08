export const MAX_ACTIVE_BATTLE_SKILLS = 3;

export function hasFreeBattleSkillSlot(equippedSkillIds: readonly string[]): boolean {
  return equippedSkillIds.length < MAX_ACTIVE_BATTLE_SKILLS;
}
