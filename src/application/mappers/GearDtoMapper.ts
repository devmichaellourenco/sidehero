import { Gear } from '../../domain/entities/Gear';
import { GearDto } from '../dto/GameStateDto';

export function mapGearToDto(gear: Gear): GearDto {
  return {
    id: gear.id,
    name: gear.name,
    templateId: gear.templateId,
    slot: gear.slot,
    rarity: gear.rarity,
    attackBonus: gear.attackBonus,
    defenseBonus: gear.defenseBonus,
    healthBonus: gear.healthBonus,
    attackSpeedBonus: gear.attackSpeedBonus,
    castSpeedBonus: gear.castSpeedBonus,
    critChanceBonus: gear.critChanceBonus,
    critDamageBonus: gear.critDamageBonus,
    fireResistBonus: gear.fireResistBonus,
    coldResistBonus: gear.coldResistBonus,
    lightningResistBonus: gear.lightningResistBonus,
    chaosResistBonus: gear.chaosResistBonus,
    allElementalResistBonus: gear.allElementalResistBonus,
    dodgeChanceBonus: gear.dodgeChanceBonus,
    blockChanceBonus: gear.blockChanceBonus,
    damageReductionBonus: gear.damageReductionBonus,
    requirements: gear.requirements
      ? {
          minLevel: gear.requirements.minLevel,
          str: gear.requirements.str,
          dex: gear.requirements.dex,
          int: gear.requirements.int,
          heroId: gear.requirements.heroId,
        }
      : { minLevel: 1 },
  };
}
