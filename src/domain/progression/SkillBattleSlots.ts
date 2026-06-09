import { BASIC_ATTACK_SKILL_ID } from './combat/BasicAttackSkill';
import { SkillId } from './SkillId';
import { getFeatureLevel, UpgradeLevels } from '../upgrades/FeatureKey';

export const MAX_ACTIVE_BATTLE_SKILLS = 3;
export const BASE_UNLOCKED_BATTLE_SKILL_SLOTS = 1;

export function getUnlockedBattleSkillSlotCount(upgradeLevels: UpgradeLevels): number {
  const extraSlots = getFeatureLevel(upgradeLevels, 'battle_skill_slots');
  return Math.min(
    MAX_ACTIVE_BATTLE_SKILLS,
    BASE_UNLOCKED_BATTLE_SKILL_SLOTS + Math.max(0, extraSlots),
  );
}

export function hasFreeBattleSkillSlot(
  equippedSkillIds: readonly string[],
  unlockedSlotCount: number = MAX_ACTIVE_BATTLE_SKILLS,
): boolean {
  return equippedSkillIds.length < unlockedSlotCount;
}

export function trimEquippedSkillIds(
  equippedSkillIds: readonly SkillId[],
  unlockedSlotCount: number,
): SkillId[] {
  const maxSlots = Math.max(1, Math.min(MAX_ACTIVE_BATTLE_SKILLS, unlockedSlotCount));
  const withoutBasic = equippedSkillIds.filter((id) => id !== BASIC_ATTACK_SKILL_ID);
  return [BASIC_ATTACK_SKILL_ID, ...withoutBasic].slice(0, maxSlots);
}
