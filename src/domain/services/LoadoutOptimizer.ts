import { GameState } from '../entities/GameState';
import { Gear, GearSlot } from '../entities/Gear';
import { Hero } from '../entities/Hero';
import { addReplacedGearToInventory, equipHeroWithGear } from './GearEquipService';
import { GearRequirementChecker } from './GearRequirementChecker';

const GEAR_SLOTS: GearSlot[] = ['weapon', 'armor', 'accessory'];

export interface EquipAction {
  heroId: string;
  gearId: string;
  slot: GearSlot;
  gain: number;
}

function gearPower(gear: Pick<Gear, 'attackBonus' | 'defenseBonus' | 'healthBonus'>): number {
  return gear.attackBonus + gear.defenseBonus + gear.healthBonus;
}

function equippedPower(hero: Hero, slot: GearSlot): number {
  const gear = hero.toProps().equipment?.[slot];
  return gear ? gearPower(gear) : 0;
}

export class LoadoutOptimizer {
  constructor(private readonly requirementChecker = new GearRequirementChecker()) {}

  planBestLoadout(state: GameState, gearIds?: string[]): EquipAction[] {
    const allowedIds = gearIds ? new Set(gearIds) : null;
    const inventory = state.inventory.filter((gear) =>
      allowedIds ? allowedIds.has(gear.id) : true,
    );

    const actions: EquipAction[] = [];

    for (const hero of state.heroes) {
      for (const slot of GEAR_SLOTS) {
        const currentPower = equippedPower(hero, slot);

        for (const gear of inventory.filter((entry) => entry.slot === slot)) {
          if (!this.requirementChecker.meets(hero, gear)) continue;

          const gain = gearPower(gear) - currentPower;
          if (gain > 0) {
            actions.push({ heroId: hero.id, gearId: gear.id, slot, gain });
          }
        }
      }
    }

    actions.sort((left, right) => right.gain - left.gain);

    const usedGear = new Set<string>();
    const usedSlots = new Set<string>();
    const selected: EquipAction[] = [];

    for (const action of actions) {
      const slotKey = `${action.heroId}:${action.slot}`;
      if (usedGear.has(action.gearId) || usedSlots.has(slotKey)) continue;
      usedGear.add(action.gearId);
      usedSlots.add(slotKey);
      selected.push(action);
    }

    return selected;
  }

  applyEquipActions(
    state: GameState,
    actions: EquipAction[],
  ): { state: GameState; equippedCount: number } {
    let heroes = [...state.heroes];
    let inventory = [...state.inventory];
    let equippedCount = 0;

    for (const action of actions) {
      const gear = inventory.find((entry) => entry.id === action.gearId);
      const hero = heroes.find((entry) => entry.id === action.heroId);
      if (!gear || !hero) continue;

      try {
        const { hero: updatedHero, replaced } = equipHeroWithGear(hero, gear);
        heroes = heroes.map((entry) => (entry.id === action.heroId ? updatedHero : entry));
        inventory = addReplacedGearToInventory(inventory, action.gearId, replaced);
        equippedCount += 1;
      } catch {
        // requisitos não atendidos — ignora
      }
    }

    if (equippedCount === 0) {
      return { state, equippedCount: 0 };
    }

    const label = equippedCount === 1 ? '1 item equipado' : `${equippedCount} itens equipados`;
    return {
      state: state.withHeroes(heroes).withInventory(inventory).addLog(`Otimizou equipe: ${label}`),
      equippedCount,
    };
  }
}
