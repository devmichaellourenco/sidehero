import { Gear, GearRarity, GearSlot } from '../entities/Gear';

export interface ILootService {
  generateGear(stage: number): Gear;
  generateGearForSlot(stage: number, slot: GearSlot, rarity: GearRarity): Gear;
  generateDeterministicGearForSlot(
    stage: number,
    slot: GearSlot,
    rarity: GearRarity,
    refreshSeed?: number,
  ): Gear;
}
