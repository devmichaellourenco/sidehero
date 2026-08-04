import { Enemy } from '../entities/Enemy';
import { Hero } from '../entities/Hero';
import { Gear } from '../entities/Gear';
import {
  clampDefensiveMitigation,
  DefensiveMitigation,
} from './DefensiveMitigation';
import {
  evasionDodgeBonusAtRank,
  ghostStepDodgeBonusAtRank,
  ironSkinDamageReductionAtRank,
  isPassiveSkillActive,
  manaShieldBlockAtRank,
  passiveSkillRank,
} from './PassiveSkillEffects';
import { getEnemyRosterEntry } from '../enemies/EnemyRosterCatalog';

function sumGearDefensive(gears: Iterable<Gear | null | undefined>): DefensiveMitigation {
  let dodgeChance = 0;
  let blockChance = 0;
  let damageReduction = 0;

  for (const gear of gears) {
    if (!gear) continue;
    dodgeChance += gear.dodgeChanceBonus;
    blockChance += gear.blockChanceBonus;
    damageReduction += gear.damageReductionBonus;
  }

  return { dodgeChance, blockChance, damageReduction };
}

function passiveDefensiveForHero(hero: Hero): DefensiveMitigation {
  let dodgeChance = hero.totalAttributes.dex * 0.0015;
  let blockChance = 0;
  let damageReduction = 0;

  const evasionRank = passiveSkillRank(hero, 'evasion');
  if (isPassiveSkillActive(hero, 'evasion')) {
    dodgeChance += evasionDodgeBonusAtRank(evasionRank);
  }

  const ghostStepRank = passiveSkillRank(hero, 'ghost_step');
  if (isPassiveSkillActive(hero, 'ghost_step')) {
    dodgeChance += ghostStepDodgeBonusAtRank(ghostStepRank);
  }

  const ironSkinRank = passiveSkillRank(hero, 'iron_skin');
  if (isPassiveSkillActive(hero, 'iron_skin')) {
    damageReduction += ironSkinDamageReductionAtRank(ironSkinRank);
  }

  const manaShieldRank = passiveSkillRank(hero, 'mana_shield');
  if (isPassiveSkillActive(hero, 'mana_shield')) {
    blockChance += manaShieldBlockAtRank(manaShieldRank);
  }

  return { dodgeChance, blockChance, damageReduction };
}

export function defensiveMitigationForHero(hero: Hero): DefensiveMitigation {
  const fromGear = sumGearDefensive(Object.values(hero.toProps().equipment ?? {}));
  const fromPassives = passiveDefensiveForHero(hero);

  return clampDefensiveMitigation({
    dodgeChance: fromGear.dodgeChance + fromPassives.dodgeChance,
    blockChance: fromGear.blockChance + fromPassives.blockChance,
    damageReduction: fromGear.damageReduction + fromPassives.damageReduction,
  });
}

export function defensiveMitigationForEnemy(enemy: Enemy): DefensiveMitigation {
  // Mesma base de esquiva por DEX que heróis; passivas de skill (evasion etc.) são de herói.
  const dodgeChance = enemy.totalAttributes.dex * 0.0015;
  const entry = getEnemyRosterEntry(enemy.enemyType);
  const roleDodge =
    entry?.rosterRole === 'boss' ? 0.04 : entry?.rosterRole === 'subboss' ? 0.02 : 0;

  return clampDefensiveMitigation({
    dodgeChance: dodgeChance + roleDodge,
    blockChance: roleDodge * 0.5,
    damageReduction: 0,
  });
}
