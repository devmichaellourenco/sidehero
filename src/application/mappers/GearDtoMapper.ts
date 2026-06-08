import { Gear } from '../../domain/entities/Gear';
import { GearDto } from '../dto/GameStateDto';

export function mapGearToDto(gear: Gear): GearDto {
  return {
    id: gear.id,
    name: gear.name,
    slot: gear.slot,
    rarity: gear.rarity,
    attackBonus: gear.attackBonus,
    defenseBonus: gear.defenseBonus,
    healthBonus: gear.healthBonus,
    requirements: gear.requirements
      ? {
          minLevel: gear.requirements.minLevel,
          str: gear.requirements.str,
          dex: gear.requirements.dex,
          int: gear.requirements.int,
        }
      : { minLevel: 1 },
  };
}
