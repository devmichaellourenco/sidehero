export type GearSlot = 'weapon' | 'armor' | 'accessory';
export type GearRarity = 'common' | 'rare' | 'epic';

export interface GearProps {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: GearRarity;
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
}

export class Gear {
  readonly id: string;
  readonly name: string;
  readonly slot: GearSlot;
  readonly rarity: GearRarity;
  readonly attackBonus: number;
  readonly defenseBonus: number;
  readonly healthBonus: number;

  private constructor(props: GearProps) {
    this.id = props.id;
    this.name = props.name;
    this.slot = props.slot;
    this.rarity = props.rarity;
    this.attackBonus = props.attackBonus;
    this.defenseBonus = props.defenseBonus;
    this.healthBonus = props.healthBonus;
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
    };
  }
}
