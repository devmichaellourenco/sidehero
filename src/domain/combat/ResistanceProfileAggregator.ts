import { Gear } from '../entities/Gear';
import { ResistanceProfile, ZERO_RESISTANCES } from './ResistanceProfile';

export function resistanceProfileFromGear(gear: Gear): ResistanceProfile {
  return {
    fire: gear.fireResistBonus,
    cold: gear.coldResistBonus,
    lightning: gear.lightningResistBonus,
    chaos: gear.chaosResistBonus,
    allElemental: gear.allElementalResistBonus,
  };
}

export function aggregateResistanceProfile(gears: Iterable<Gear | null | undefined>): ResistanceProfile {
  const total = { ...ZERO_RESISTANCES };

  for (const gear of gears) {
    if (!gear) continue;
    const profile = resistanceProfileFromGear(gear);
    total.fire += profile.fire;
    total.cold += profile.cold;
    total.lightning += profile.lightning;
    total.chaos += profile.chaos;
    total.allElemental += profile.allElemental;
  }

  return total;
}

export function resistanceProfileFromHeroEquipment(
  equipment: Partial<Record<string, Gear | null>>,
): ResistanceProfile {
  return aggregateResistanceProfile(Object.values(equipment ?? {}));
}
