import { Gear } from '../../domain/entities/Gear';
import { Hero } from '../../domain/entities/Hero';

export function equipHeroWithGear(
  hero: Hero,
  gear: Gear,
): { hero: Hero; replaced: Gear | null } {
  const oldGear = hero.toProps().equipment?.[gear.slot] ?? null;

  return {
    hero: hero.equip(gear),
    replaced: oldGear,
  };
}

export function addReplacedGearToInventory(
  inventory: Gear[],
  removedGearId: string,
  replaced: Gear | null,
): Gear[] {
  const nextInventory = inventory.filter((entry) => entry.id !== removedGearId);
  return replaced ? [...nextInventory, replaced] : nextInventory;
}
