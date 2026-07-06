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

export type GearUpgradeStatus = 'upgrade' | 'downgrade' | 'equal';

export interface GearUpgradePreview {
  heroId: string;
  heroName: string;
  gain: number;
  status: GearUpgradeStatus;
  equipped: Gear | null;
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

  previewUpgradeForGear(state: GameState, gear: Gear): GearUpgradePreview | null {
    if (state.heroes.length === 0) return null;
    return this.previewUpgradeForHeroes(state.heroes, gear);
  }

  previewUpgradeForActiveParty(state: GameState, gear: Gear): GearUpgradePreview | null {
    const party = state.activeHeroes();
    if (party.length === 0) return null;
    return this.previewUpgradeForHeroes(party, gear);
  }

  countActivePartyUpgrades(state: GameState): number {
    const party = state.activeHeroes();
    if (party.length === 0 || state.inventory.length === 0) return 0;

    let count = 0;
    for (const gear of state.inventory) {
      const preview = this.previewUpgradeForActiveParty(state, gear);
      if (preview?.status === 'upgrade') {
        count += 1;
      }
    }

    return count;
  }

  private previewUpgradeForHeroes(heroes: readonly Hero[], gear: Gear): GearUpgradePreview | null {
    let best: { hero: Hero; gain: number; equipped: Gear | null } | null = null;

    for (const hero of heroes) {
      if (!this.requirementChecker.meets(hero, gear)) continue;

      const equipped = hero.toProps().equipment?.[gear.slot] ?? null;
      const currentPower = equipped ? gearPower(equipped) : 0;
      const gain = gearPower(gear) - currentPower;

      if (!best || gain > best.gain) {
        best = { hero, gain, equipped };
      }
    }

    if (!best) return null;

    return {
      heroId: best.hero.id,
      heroName: best.hero.name,
      gain: best.gain,
      status: best.gain > 0 ? 'upgrade' : best.gain < 0 ? 'downgrade' : 'equal',
      equipped: best.equipped,
    };
  }

  buildInventoryUpgradePreviews(state: GameState): Record<string, GearUpgradePreview> {
    const previews: Record<string, GearUpgradePreview> = {};

    for (const gear of state.inventory) {
      const preview = this.previewUpgradeForGear(state, gear);
      if (preview) {
        previews[gear.id] = preview;
      }
    }

    return previews;
  }

  planBestLoadout(state: GameState, gearIds?: string[]): EquipAction[] {
    const allowedIds = gearIds ? new Set(gearIds) : null;
    const inventory = state.inventory.filter((gear) =>
      allowedIds ? allowedIds.has(gear.id) : true,
    );

    const actions: EquipAction[] = [];
    const heroes = state.activeHeroes();

    for (const hero of heroes) {
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

  optimizeLoadout(
    state: GameState,
    gearIds?: string[],
  ): { state: GameState; equippedCount: number } {
    let current = state;
    let totalEquipped = 0;
    const maxRounds = 24;

    for (let round = 0; round < maxRounds; round += 1) {
      const actions = this.planBestLoadout(current, round === 0 ? gearIds : undefined);
      if (actions.length === 0) break;

      const result = this.applyEquipActions(current, actions);
      if (result.equippedCount === 0) break;

      current = result.state;
      totalEquipped += result.equippedCount;
    }

    if (totalEquipped === 0) {
      return { state, equippedCount: 0 };
    }

    const label = totalEquipped === 1 ? '1 item equipado' : `${totalEquipped} itens equipados`;
    return {
      state: current.addLog(`Otimizou equipe: ${label}`),
      equippedCount: totalEquipped,
    };
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

    return {
      state: state.withHeroes(heroes).withInventory(inventory),
      equippedCount,
    };
  }
}
