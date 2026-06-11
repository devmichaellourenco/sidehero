export type GearSlot = 'weapon' | 'armor' | 'accessory';
export type GearRarity = 'common' | 'rare' | 'epic';

export interface GearRequirements {
  minLevel: number;
  str?: number;
  dex?: number;
  int?: number;
}

export interface GearProps {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: GearRarity;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  attackSpeedBonus?: number;
  castSpeedBonus?: number;
  critChanceBonus?: number;
  critDamageBonus?: number;
  requirements?: GearRequirements;
}

const DEFAULT_REQUIREMENTS: GearRequirements = { minLevel: 1 };

export class Gear {
  readonly id: string;
  readonly name: string;
  readonly slot: GearSlot;
  readonly rarity: GearRarity;
  readonly attackBonus: number;
  readonly defenseBonus: number;
  readonly healthBonus: number;
  readonly attackSpeedBonus: number;
  readonly castSpeedBonus: number;
  readonly critChanceBonus: number;
  readonly critDamageBonus: number;
  readonly requirements: GearRequirements;

  private constructor(props: GearProps) {
    this.id = props.id;
    this.name = props.name;
    this.slot = props.slot;
    this.rarity = props.rarity;
    this.attackBonus = props.attackBonus;
    this.defenseBonus = props.defenseBonus;
    this.healthBonus = props.healthBonus;
    this.attackSpeedBonus = props.attackSpeedBonus ?? 0;
    this.castSpeedBonus = props.castSpeedBonus ?? 0;
    this.critChanceBonus = props.critChanceBonus ?? 0;
    this.critDamageBonus = props.critDamageBonus ?? 0;
    this.requirements = props.requirements ?? DEFAULT_REQUIREMENTS;
  }

  static create(props: GearProps): Gear {
    return new Gear(props);
  }

  toProps(): GearProps {
    return {
      id: this.id,
      name: this.name,
      slot: this.slot,
      rarity: this.rarity,
      attackBonus: this.attackBonus,
      defenseBonus: this.defenseBonus,
      healthBonus: this.healthBonus,
      attackSpeedBonus: this.attackSpeedBonus,
      castSpeedBonus: this.castSpeedBonus,
      critChanceBonus: this.critChanceBonus,
      critDamageBonus: this.critDamageBonus,
      requirements: this.requirements,
    };
  }
}
