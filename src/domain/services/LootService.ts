import { ChestType } from '../combat/ChestType';
import { lootPrimaryStatScale } from '../combat/DifficultyCombatScaling';
import { Gear, GearRarity, GearSlot } from '../entities/Gear';
import { ACTIVE_GEAR_SLOTS } from '../gear/GearSlotCatalog';
import { GearRequirementChecker } from './GearRequirementChecker';
import { ILootService } from './ILootService';

const SLOT_NAMES: Record<GearSlot, string[]> = {
  weapon: ['Espada Enferrujada', 'Machado Pixel', 'Cajado Arcano', 'Lâmina Side'],
  armor: ['Escudo de Madeira', 'Armadura 8-bit', 'Manto do Herói', 'Placa Chrome'],
  accessory: ['Anel de Cobre', 'Amuleto Idle', 'Pingente RPG', 'Badge Extensão'],
};

const RARITY_MULTIPLIER: Record<GearRarity, number> = {
  common: 1,
  uncommon: 1.25,
  rare: 1.6,
  epic: 2.5,
  legendary: 3.5,
  mythic: 5,
};

const CHEST_RARITY_WEIGHTS: Record<ChestType, Record<GearRarity, number>> = {
  monster: {
    common: 0.55,
    uncommon: 0.25,
    rare: 0.14,
    epic: 0.05,
    legendary: 0.01,
    mythic: 0,
  },
  boss: {
    common: 0.2,
    uncommon: 0.28,
    rare: 0.3,
    epic: 0.15,
    legendary: 0.06,
    mythic: 0.01,
  },
  act_boss: {
    common: 0.05,
    uncommon: 0.1,
    rare: 0.25,
    epic: 0.35,
    legendary: 0.18,
    mythic: 0.07,
  },
};

const RARITY_ORDER: GearRarity[] = [
  'mythic',
  'legendary',
  'epic',
  'rare',
  'uncommon',
  'common',
];

export class LootService implements ILootService {
  generateGear(stage: number): Gear {
    return this.generateGearForChest('monster', stage);
  }

  generateGearForChest(chestType: ChestType, stage: number): Gear {
    const slot = ACTIVE_GEAR_SLOTS[Math.floor(Math.random() * ACTIVE_GEAR_SLOTS.length)];
    const rarity = this.rollRarityForChest(chestType, stage);
    return this.generateGearForSlot(stage, slot, rarity, chestType);
  }

  generateGearForSlot(stage: number, slot: GearSlot, rarity: GearRarity, chestType: ChestType = 'monster'): Gear {
    const multiplier = RARITY_MULTIPLIER[rarity];
    const names = SLOT_NAMES[slot];
    const name = names[Math.floor(Math.random() * names.length)];
    return this.createGear(stage, slot, rarity, multiplier, name, undefined, 0, chestType);
  }

  generateDeterministicGearForSlot(
    stage: number,
    slot: GearSlot,
    rarity: GearRarity,
    refreshSeed = 0,
  ): Gear {
    const multiplier = RARITY_MULTIPLIER[rarity];
    const names = SLOT_NAMES[slot];
    const slotSeed = slot === 'weapon' ? 1 : slot === 'armor' ? 2 : 3;
    const nameIndex = (stage * 3 + slotSeed + refreshSeed * 7) % names.length;
    const name = names[nameIndex];
    const statBump = refreshSeed % 3;

    return this.createGear(
      stage,
      slot,
      rarity,
      multiplier,
      name,
      `shop-gear-${stage}-${refreshSeed}-${slot}`,
      statBump,
      'monster',
    );
  }

  private createGear(
    stage: number,
    slot: GearSlot,
    rarity: GearRarity,
    multiplier: number,
    name: string,
    id?: string,
    statBump = 0,
    chestType: ChestType = 'monster',
  ): Gear {
    const base = Math.floor((2 + Math.floor(stage / 2) + statBump) * lootPrimaryStatScale(stage));
    const secondary = this.rollSecondaryStats(slot, rarity, chestType);
    const resistances = this.rollResistanceBonuses(slot, rarity, chestType);
    const defensive = this.rollDefensiveBonuses(slot, rarity);

    return Gear.create({
      id: id ?? `gear-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${name} (${rarity})`,
      slot,
      rarity,
      attackBonus: slot === 'weapon' ? Math.floor(base * multiplier) : Math.floor(base * 0.3),
      defenseBonus: slot === 'armor' ? Math.floor(base * multiplier) : Math.floor(base * 0.2),
      healthBonus: slot === 'accessory' ? Math.floor(base * multiplier * 3) : Math.floor(base),
      ...secondary,
      ...resistances,
      ...defensive,
      requirements: GearRequirementChecker.inferRequirements(stage, slot, rarity),
    });
  }

  private rollResistanceBonuses(
    slot: GearSlot,
    rarity: GearRarity,
    chestType: ChestType,
  ): {
    fireResistBonus: number;
    coldResistBonus: number;
    lightningResistBonus: number;
    chaosResistBonus: number;
    allElementalResistBonus: number;
  } {
    const empty = {
      fireResistBonus: 0,
      coldResistBonus: 0,
      lightningResistBonus: 0,
      chaosResistBonus: 0,
      allElementalResistBonus: 0,
    };

    if (rarity === 'common') {
      return empty;
    }

    const qualityBoost = chestType === 'act_boss' ? 1.4 : chestType === 'boss' ? 1.15 : 1;
    const rarityCap =
      rarity === 'mythic'
        ? 22
        : rarity === 'legendary'
          ? 16
          : rarity === 'epic'
            ? 12
            : rarity === 'rare'
              ? 8
              : 5;
    const rollValue = () => Math.max(1, Math.floor(Math.random() * rarityCap * qualityBoost));

    if (slot === 'armor') {
      const elementRoll = Math.random();
      if (elementRoll < 0.34) return { ...empty, fireResistBonus: rollValue() };
      if (elementRoll < 0.67) return { ...empty, coldResistBonus: rollValue() };
      return { ...empty, lightningResistBonus: rollValue() };
    }

    if (slot === 'accessory') {
      if (Math.random() < 0.55) {
        return { ...empty, chaosResistBonus: rollValue() };
      }
      return { ...empty, allElementalResistBonus: Math.max(1, Math.floor(rollValue() * 0.6)) };
    }

    return empty;
  }

  private rollDefensiveBonuses(
    slot: GearSlot,
    rarity: GearRarity,
  ): {
    dodgeChanceBonus: number;
    blockChanceBonus: number;
    damageReductionBonus: number;
  } {
    const empty = { dodgeChanceBonus: 0, blockChanceBonus: 0, damageReductionBonus: 0 };

    if (slot !== 'armor' || (rarity !== 'legendary' && rarity !== 'mythic')) {
      return empty;
    }

    const maxRoll = rarity === 'mythic' ? 0.08 : 0.06;
    const minRoll = rarity === 'mythic' ? 0.03 : 0.02;
    const rollValue = () =>
      Math.round((minRoll + Math.random() * (maxRoll - minRoll)) * 1000) / 1000;
    const pick = Math.random();

    if (pick < 0.34) return { ...empty, dodgeChanceBonus: rollValue() };
    if (pick < 0.67) return { ...empty, blockChanceBonus: rollValue() };
    return { ...empty, damageReductionBonus: rollValue() };
  }

  private rollSecondaryStats(
    slot: GearSlot,
    rarity: GearRarity,
    chestType: ChestType,
  ): {
    attackSpeedBonus: number;
    castSpeedBonus: number;
    critChanceBonus: number;
    critDamageBonus: number;
  } {
    const qualityBoost = chestType === 'act_boss' ? 1.5 : chestType === 'boss' ? 1.2 : 1;
    const rarityBoost =
      rarity === 'mythic'
        ? 1.8
        : rarity === 'legendary'
          ? 1.5
          : rarity === 'epic'
            ? 1.4
            : rarity === 'rare'
              ? 1.1
              : rarity === 'uncommon'
                ? 1.05
                : 1;
    const boost = qualityBoost * rarityBoost;

    if (slot === 'weapon') {
      return {
        attackSpeedBonus: Math.random() < 0.45 * boost ? Math.round(0.04 * boost * 100) / 100 : 0,
        castSpeedBonus: 0,
        critChanceBonus: Math.random() < 0.3 * boost ? Math.round(0.015 * boost * 1000) / 1000 : 0,
        critDamageBonus: 0,
      };
    }

    if (slot === 'accessory') {
      return {
        attackSpeedBonus: 0,
        castSpeedBonus: Math.random() < 0.25 * boost ? Math.round(0.05 * boost * 100) / 100 : 0,
        critChanceBonus: Math.random() < 0.35 * boost ? Math.round(0.02 * boost * 1000) / 1000 : 0,
        critDamageBonus: Math.random() < 0.4 * boost ? Math.round(0.1 * boost * 100) / 100 : 0,
      };
    }

    return {
      attackSpeedBonus: 0,
      castSpeedBonus: 0,
      critChanceBonus: 0,
      critDamageBonus: 0,
    };
  }

  private rollRarityForChest(chestType: ChestType, stage: number): GearRarity {
    const weights = { ...CHEST_RARITY_WEIGHTS[chestType] };
    const stageBonus = Math.min(0.08, stage * 0.0008);
    weights.epic += stageBonus * 0.5;
    weights.legendary += stageBonus * 0.3;
    weights.mythic += stageBonus * 0.2;
    weights.common = Math.max(0.02, weights.common - stageBonus);

    const roll = Math.random();
    let cumulative = 0;

    for (const rarity of RARITY_ORDER) {
      cumulative += weights[rarity];
      if (roll <= cumulative) {
        return rarity;
      }
    }

    return 'common';
  }

  private rollRarity(stage: number): GearRarity {
    return this.rollRarityForChest('monster', stage);
  }
}
