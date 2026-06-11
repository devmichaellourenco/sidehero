import { ChestType } from '../combat/ChestType';
import { Gear, GearRarity, GearSlot } from '../entities/Gear';
import { GearRequirementChecker } from './GearRequirementChecker';
import { ILootService } from './ILootService';

const SLOT_NAMES: Record<GearSlot, string[]> = {
  weapon: ['Espada Enferrujada', 'Machado Pixel', 'Cajado Arcano', 'Lâmina Side'],
  armor: ['Escudo de Madeira', 'Armadura 8-bit', 'Manto do Herói', 'Placa Chrome'],
  accessory: ['Anel de Cobre', 'Amuleto Idle', 'Pingente RPG', 'Badge Extensão'],
};

const RARITY_MULTIPLIER: Record<GearRarity, number> = {
  common: 1,
  rare: 1.6,
  epic: 2.5,
};

const CHEST_RARITY_WEIGHTS: Record<ChestType, { common: number; rare: number; epic: number }> = {
  monster: { common: 0.82, rare: 0.16, epic: 0.02 },
  boss: { common: 0.35, rare: 0.5, epic: 0.15 },
  act_boss: { common: 0.1, rare: 0.35, epic: 0.55 },
};

export class LootService implements ILootService {
  generateGear(stage: number): Gear {
    return this.generateGearForChest('monster', stage);
  }

  generateGearForChest(chestType: ChestType, stage: number): Gear {
    const slots: GearSlot[] = ['weapon', 'armor', 'accessory'];
    const slot = slots[Math.floor(Math.random() * slots.length)];
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
    const base = 2 + Math.floor(stage / 2) + statBump;
    const secondary = this.rollSecondaryStats(slot, rarity, chestType);

    return Gear.create({
      id: id ?? `gear-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${name} (${rarity})`,
      slot,
      rarity,
      attackBonus: slot === 'weapon' ? Math.floor(base * multiplier) : Math.floor(base * 0.3),
      defenseBonus: slot === 'armor' ? Math.floor(base * multiplier) : Math.floor(base * 0.2),
      healthBonus: slot === 'accessory' ? Math.floor(base * multiplier * 3) : Math.floor(base),
      ...secondary,
      requirements: GearRequirementChecker.inferRequirements(stage, slot, rarity),
    });
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
    const rarityBoost = rarity === 'epic' ? 1.4 : rarity === 'rare' ? 1.1 : 1;
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
    const weights = CHEST_RARITY_WEIGHTS[chestType];
    const stageBonus = Math.min(0.12, stage * 0.001);
    const roll = Math.random();

    if (roll > 1 - weights.epic - stageBonus) return 'epic';
    if (roll > 1 - weights.epic - weights.rare - stageBonus) return 'rare';
    return 'common';
  }

  private rollRarity(stage: number): GearRarity {
    return this.rollRarityForChest('monster', stage);
  }
}
