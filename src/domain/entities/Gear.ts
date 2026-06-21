import { ActiveGearSlot } from '../gear/GearSlotCatalog';

/** Slot ativo no jogo (alias estável na UI). */
export type GearSlot = ActiveGearSlot;

export const GEAR_RARITIES = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
] as const;

export type GearRarity = (typeof GEAR_RARITIES)[number];

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
  fireResistBonus?: number;
  coldResistBonus?: number;
  lightningResistBonus?: number;
  chaosResistBonus?: number;
  allElementalResistBonus?: number;
  dodgeChanceBonus?: number;
  blockChanceBonus?: number;
  damageReductionBonus?: number;
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
  readonly fireResistBonus: number;
  readonly coldResistBonus: number;
  readonly lightningResistBonus: number;
  readonly chaosResistBonus: number;
  readonly allElementalResistBonus: number;
  readonly dodgeChanceBonus: number;
  readonly blockChanceBonus: number;
  readonly damageReductionBonus: number;
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
    this.fireResistBonus = props.fireResistBonus ?? 0;
    this.coldResistBonus = props.coldResistBonus ?? 0;
    this.lightningResistBonus = props.lightningResistBonus ?? 0;
    this.chaosResistBonus = props.chaosResistBonus ?? 0;
    this.allElementalResistBonus = props.allElementalResistBonus ?? 0;
    this.dodgeChanceBonus = props.dodgeChanceBonus ?? 0;
    this.blockChanceBonus = props.blockChanceBonus ?? 0;
    this.damageReductionBonus = props.damageReductionBonus ?? 0;
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
      fireResistBonus: this.fireResistBonus,
      coldResistBonus: this.coldResistBonus,
      lightningResistBonus: this.lightningResistBonus,
      chaosResistBonus: this.chaosResistBonus,
      allElementalResistBonus: this.allElementalResistBonus,
      dodgeChanceBonus: this.dodgeChanceBonus,
      blockChanceBonus: this.blockChanceBonus,
      damageReductionBonus: this.damageReductionBonus,
      requirements: this.requirements,
    };
  }
}
