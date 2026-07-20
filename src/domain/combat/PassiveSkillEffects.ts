import { Hero } from '../entities/Hero';
import { SkillId } from '../progression/SkillId';

export const PASSIVE_EQUIPPED_SKILL_IDS = [
  'evasion',
  'vitality',
  'iron_skin',
  'mana_shield',
] as const;

export type PassiveEquippedSkillId = (typeof PASSIVE_EQUIPPED_SKILL_IDS)[number];

export const EVASION_DODGE_PER_RANK = 0.025;
export const VITALITY_HP_STR_FACTOR_PER_RANK = 2;
export const IRON_SKIN_DAMAGE_REDUCTION_PER_RANK = 0.04;
export const MANA_SHIELD_BLOCK_PER_RANK = 0.03;

export function isPassiveEquippedSkill(skillId: string): skillId is PassiveEquippedSkillId {
  return (PASSIVE_EQUIPPED_SKILL_IDS as readonly string[]).includes(skillId);
}

export function passiveSkillRank(hero: Hero, skillId: string): number {
  return hero.toProps().skillRanks[skillId as SkillId] ?? 0;
}

export function isPassiveSkillActive(hero: Hero, skillId: string): boolean {
  if (!isPassiveEquippedSkill(skillId)) return false;
  const props = hero.toProps();
  return (
    props.equippedSkillIds.includes(skillId as SkillId) &&
    passiveSkillRank(hero, skillId) >= 1
  );
}

export function evasionDodgeBonusAtRank(rank: number): number {
  return Math.max(0, rank) * EVASION_DODGE_PER_RANK;
}

export function vitalityHealthBonusAtRank(rank: number, str: number): number {
  return Math.max(0, rank) * Math.max(0, str) * VITALITY_HP_STR_FACTOR_PER_RANK;
}

export function ironSkinDamageReductionAtRank(rank: number): number {
  return Math.max(0, rank) * IRON_SKIN_DAMAGE_REDUCTION_PER_RANK;
}

export function manaShieldBlockAtRank(rank: number): number {
  return Math.max(0, rank) * MANA_SHIELD_BLOCK_PER_RANK;
}

export function passiveVitalityHealthBonus(hero: Hero): number {
  if (!isPassiveSkillActive(hero, 'vitality')) return 0;
  return vitalityHealthBonusAtRank(passiveSkillRank(hero, 'vitality'), hero.totalAttributes.str);
}
