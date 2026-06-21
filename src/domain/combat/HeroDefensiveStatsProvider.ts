import { Enemy } from '../entities/Enemy';
import { Hero } from '../entities/Hero';
import { Gear } from '../entities/Gear';
import {
  clampDefensiveMitigation,
  DefensiveMitigation,
  ZERO_DEFENSIVE,
} from './DefensiveMitigation';
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
  const props = hero.toProps();
  const ranks = props.skillRanks;
  const equipped = new Set(props.equippedSkillIds);

  let dodgeChance = hero.totalAttributes.dex * 0.0015;
  let blockChance = 0;
  let damageReduction = 0;

  if (equipped.has('evasion') && (ranks.evasion ?? 0) >= 1) {
    dodgeChance += (ranks.evasion ?? 0) * 0.025;
  }

  if (equipped.has('iron_skin') && (ranks.iron_skin ?? 0) >= 1) {
    damageReduction += (ranks.iron_skin ?? 0) * 0.04;
  }

  if (equipped.has('mana_shield') && (ranks.mana_shield ?? 0) >= 1) {
    blockChance += (ranks.mana_shield ?? 0) * 0.03;
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
  const entry = getEnemyRosterEntry(enemy.enemyType);
  if (!entry) {
    return ZERO_DEFENSIVE;
  }

  const roleDodge =
    entry.rosterRole === 'boss' ? 0.04 : entry.rosterRole === 'subboss' ? 0.02 : 0;
  const roleBlock = roleDodge * 0.5;

  return clampDefensiveMitigation({
    dodgeChance: roleDodge,
    blockChance: roleBlock,
    damageReduction: 0,
  });
}
