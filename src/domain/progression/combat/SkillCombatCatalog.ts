import { SkillCombatProfile } from './SkillCombatProfile';

export const SKILL_COMBAT_CATALOG: SkillCombatProfile[] = [
  {
    skillId: 'minor_heal',
    kind: 'heal_ally',
    priority: 100,
    basePower: 12,
    powerPerRank: 8,
    attributeFactor: 1.2,
    healThreshold: 0.85,
  },
  {
    skillId: 'fireball',
    kind: 'damage_magic',
    priority: 90,
    basePower: 10,
    powerPerRank: 6,
    attributeFactor: 1.5,
  },
  {
    skillId: 'arcane_bolt',
    kind: 'damage_magic',
    priority: 80,
    basePower: 8,
    powerPerRank: 4,
    attributeFactor: 1.3,
  },
  {
    skillId: 'smite',
    kind: 'damage_magic',
    priority: 75,
    basePower: 7,
    powerPerRank: 5,
    attributeFactor: 1.2,
  },
  {
    skillId: 'arcane_touch',
    kind: 'damage_magic',
    priority: 50,
    basePower: 5,
    powerPerRank: 3,
    attributeFactor: 1.0,
  },
  {
    skillId: 'shield_bash',
    kind: 'damage_physical',
    priority: 60,
    basePower: 6,
    powerPerRank: 4,
    attributeFactor: 0.8,
  },
  {
    skillId: 'power_attack',
    kind: 'damage_physical',
    priority: 40,
    basePower: 4,
    powerPerRank: 3,
    attributeFactor: 0.6,
  },
];

const profileMap = new Map(SKILL_COMBAT_CATALOG.map((profile) => [profile.skillId, profile]));

export function getSkillCombatProfile(skillId: string): SkillCombatProfile | undefined {
  return profileMap.get(skillId);
}

export function listCombatProfilesForEquipped(equippedSkillIds: string[]): SkillCombatProfile[] {
  return equippedSkillIds
    .map((id) => profileMap.get(id))
    .filter((profile): profile is SkillCombatProfile => profile !== undefined)
    .sort((a, b) => b.priority - a.priority);
}
