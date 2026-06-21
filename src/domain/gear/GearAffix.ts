import { GearRarity } from '../entities/Gear';

/** Stats modulares para expansão futura (resistências, % elemento, etc.). */
export type GearAffixStat =
  | 'attack_speed'
  | 'cast_speed'
  | 'crit_chance'
  | 'crit_damage'
  | 'fire_resist'
  | 'cold_resist'
  | 'lightning_resist'
  | 'chaos_resist'
  | 'all_elemental_resist'
  | 'fire_damage_percent'
  | 'physical_damage_percent';

export interface GearAffix {
  stat: GearAffixStat;
  value: number;
  minRarity: GearRarity;
}
