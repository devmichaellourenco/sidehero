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
  // Ascensão — cura
  {
    skillId: 'oracle_mend',
    kind: 'heal_ally',
    priority: 110,
    basePower: 18,
    powerPerRank: 10,
    attributeFactor: 1.4,
    healThreshold: 0.85,
  },
  {
    skillId: 'oracle_sanctuary',
    kind: 'heal_ally',
    priority: 105,
    basePower: 14,
    powerPerRank: 8,
    attributeFactor: 1.2,
    healThreshold: 0.9,
  },
  {
    skillId: 'guardian_resolve',
    kind: 'heal_ally',
    priority: 95,
    basePower: 10,
    powerPerRank: 6,
    attributeFactor: 0.8,
    healThreshold: 0.85,
  },
  // Ascensão — dano físico
  {
    skillId: 'reaver_cleave',
    kind: 'damage_physical',
    priority: 85,
    basePower: 12,
    powerPerRank: 6,
    attributeFactor: 1.0,
  },
  {
    skillId: 'reaver_fury',
    kind: 'damage_physical',
    priority: 82,
    basePower: 10,
    powerPerRank: 5,
    attributeFactor: 0.9,
  },
  {
    skillId: 'guardian_strike',
    kind: 'damage_physical',
    priority: 78,
    basePower: 9,
    powerPerRank: 5,
    attributeFactor: 0.85,
  },
  // Ascensão — dano mágico
  {
    skillId: 'pyro_inferno',
    kind: 'damage_magic',
    priority: 92,
    basePower: 14,
    powerPerRank: 7,
    attributeFactor: 1.6,
  },
  {
    skillId: 'pyro_ember',
    kind: 'damage_magic',
    priority: 88,
    basePower: 10,
    powerPerRank: 5,
    attributeFactor: 1.3,
  },
  {
    skillId: 'arcane_surge',
    kind: 'damage_magic',
    priority: 91,
    basePower: 13,
    powerPerRank: 6,
    attributeFactor: 1.5,
  },
  {
    skillId: 'arcane_focus',
    kind: 'damage_magic',
    priority: 87,
    basePower: 9,
    powerPerRank: 5,
    attributeFactor: 1.2,
  },
  {
    skillId: 'inquisitor_judgment',
    kind: 'damage_magic',
    priority: 86,
    basePower: 11,
    powerPerRank: 6,
    attributeFactor: 1.4,
  },
  {
    skillId: 'inquisitor_flame',
    kind: 'damage_magic',
    priority: 83,
    basePower: 8,
    powerPerRank: 4,
    attributeFactor: 1.1,
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
