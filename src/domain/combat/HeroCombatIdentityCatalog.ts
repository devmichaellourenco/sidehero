import { HeroClass, HERO_CLASSES } from '../entities/HeroClass';
import { CombatantIdentity } from './CombatantIdentity';

export type HeroCombatIdentity = CombatantIdentity;

const HERO_COMBAT_IDENTITY: Record<HeroClass, HeroCombatIdentity> = {
  sorcerer: {
    basicAttackDamageRatio: 0.5,
    skillCooldownTurnSeconds: 5,
    attackSpeedFactor: 0.29,
    attackPerLevel: 4,
    defensePerLevel: 3,
    healthPerLevel: 15,
    levelUpAttackGain: 3,
    levelUpDefenseGain: 3,
    levelUpHealthGain: 15,
  },
  knight: {
    basicAttackDamageRatio: 0.5,
    skillCooldownTurnSeconds: 5,
    attackSpeedFactor: 0.29,
    attackPerLevel: 4,
    defensePerLevel: 3,
    healthPerLevel: 15,
    levelUpAttackGain: 3,
    levelUpDefenseGain: 3,
    levelUpHealthGain: 15,
  },
  priest: {
    basicAttackDamageRatio: 0.5,
    skillCooldownTurnSeconds: 5,
    attackSpeedFactor: 0.29,
    attackPerLevel: 4,
    defensePerLevel: 3,
    healthPerLevel: 15,
    levelUpAttackGain: 3,
    levelUpDefenseGain: 3,
    levelUpHealthGain: 15,
  },
  berserker: {
    basicAttackDamageRatio: 0.5,
    skillCooldownTurnSeconds: 5,
    attackSpeedFactor: 0.29,
    attackPerLevel: 4,
    defensePerLevel: 3,
    healthPerLevel: 15,
    levelUpAttackGain: 3,
    levelUpDefenseGain: 3,
    levelUpHealthGain: 15,
  },
  archer: {
    basicAttackDamageRatio: 0.5,
    skillCooldownTurnSeconds: 5,
    attackSpeedFactor: 0.29,
    attackPerLevel: 4,
    defensePerLevel: 3,
    healthPerLevel: 15,
    levelUpAttackGain: 3,
    levelUpDefenseGain: 3,
    levelUpHealthGain: 15,
  },
  paladin: {
    basicAttackDamageRatio: 0.5,
    skillCooldownTurnSeconds: 5,
    attackSpeedFactor: 0.29,
    attackPerLevel: 4,
    defensePerLevel: 3,
    healthPerLevel: 15,
    levelUpAttackGain: 3,
    levelUpDefenseGain: 3,
    levelUpHealthGain: 15,
  },
};

export function getHeroCombatIdentity(heroClass: HeroClass): HeroCombatIdentity {
  return HERO_COMBAT_IDENTITY[heroClass];
}

export function listHeroCombatIdentities(): ReadonlyArray<{
  heroClass: HeroClass;
  identity: HeroCombatIdentity;
}> {
  return HERO_CLASSES.map((heroClass) => ({
    heroClass,
    identity: HERO_COMBAT_IDENTITY[heroClass],
  }));
}
