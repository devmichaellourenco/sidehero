import { Gear, GearRarity, GearSlot } from '../entities/Gear';

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

export class LootService {
  generateGear(stage: number): Gear {
    const slots: GearSlot[] = ['weapon', 'armor', 'accessory'];
    const slot = slots[Math.floor(Math.random() * slots.length)];
    const rarity = this.rollRarity(stage);
    const multiplier = RARITY_MULTIPLIER[rarity];
    const names = SLOT_NAMES[slot];
    const name = names[Math.floor(Math.random() * names.length)];

    const base = 2 + Math.floor(stage / 2);

    return Gear.create({
      id: `gear-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${name} (${rarity})`,
      slot,
      rarity,
      attackBonus: slot === 'weapon' ? Math.floor(base * multiplier) : Math.floor(base * 0.3),
      defenseBonus: slot === 'armor' ? Math.floor(base * multiplier) : Math.floor(base * 0.2),
      healthBonus: slot === 'accessory' ? Math.floor(base * multiplier * 3) : Math.floor(base),
    });
  }

  private rollRarity(stage: number): GearRarity {
    const roll = Math.random() * 100 + stage * 0.5;
    if (roll > 92) return 'epic';
    if (roll > 70) return 'rare';
    return 'common';
  }
}
