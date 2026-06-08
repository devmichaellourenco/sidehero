import { Hero } from '../entities/Hero';
import { Gear, GearRequirements } from '../entities/Gear';

export interface RequirementCheckResult {
  met: boolean;
  unmetLabels: string[];
}

export class GearRequirementChecker {
  check(hero: Hero, gear: Gear): RequirementCheckResult {
    const unmetLabels: string[] = [];
    const reqs = gear.requirements;
    const attrs = hero.totalAttributes;

    if (hero.level < reqs.minLevel) {
      unmetLabels.push(`Level ${reqs.minLevel}`);
    }
    if (reqs.str !== undefined && attrs.str < reqs.str) {
      unmetLabels.push(`STR ${reqs.str}`);
    }
    if (reqs.dex !== undefined && attrs.dex < reqs.dex) {
      unmetLabels.push(`DEX ${reqs.dex}`);
    }
    if (reqs.int !== undefined && attrs.int < reqs.int) {
      unmetLabels.push(`INT ${reqs.int}`);
    }

    return { met: unmetLabels.length === 0, unmetLabels };
  }

  meets(hero: Hero, gear: Gear): boolean {
    return this.check(hero, gear).met;
  }

  static inferRequirements(
    stage: number,
    slot: Gear['slot'],
    rarity: Gear['rarity'],
  ): GearRequirements {
    const baseLevel = Math.max(1, Math.floor(stage / 3));
    const rarityBump = rarity === 'epic' ? 3 : rarity === 'rare' ? 1 : 0;

    const reqs: GearRequirements = { minLevel: baseLevel + rarityBump };

    if (slot === 'weapon') {
      reqs.str = Math.max(0, baseLevel - 1);
      if (rarity !== 'common') reqs.str = (reqs.str ?? 0) + rarityBump;
    } else if (slot === 'armor') {
      reqs.dex = Math.max(0, baseLevel - 1);
      if (rarity !== 'common') reqs.dex = (reqs.dex ?? 0) + rarityBump;
    } else {
      reqs.int = Math.max(0, baseLevel - 1);
      if (rarity !== 'common') reqs.int = (reqs.int ?? 0) + rarityBump;
    }

    return reqs;
  }
}
