import { describe, expect, it } from 'vitest';
import { Hero } from '../entities/Hero';
import { Gear } from '../entities/Gear';
import { CombatProfileProvider } from './CombatProfileProvider';

describe('CombatProfileProvider', () => {
  const profiles = new CombatProfileProvider();

  it('aplica redução de cooldown positiva no cast speed efetivo', () => {
    const hero = Hero.createStarter('h1', 'sorcerer', 'Mira').equip(
      Gear.create({
        id: 'ring-cdr',
        name: 'Anel Rápido',
        templateId: 'copper_ring',
        slot: 'accessory',
        rarity: 'rare',
        attackBonus: 0,
        defenseBonus: 0,
        healthBonus: 0,
        cooldownReductionBonus: 20,
      }),
    );

    const profile = profiles.forHero(hero);
    expect(profile.castSpeed).toBeGreaterThan(1);
  });

  it('limita penalidade de velocidade de ataque negativa', () => {
    const hero = Hero.createStarter('h1', 'knight', 'Tank').equip(
      Gear.create({
        id: 'heavy-axe',
        name: 'Machado Pesado',
        templateId: 'pixel_axe',
        slot: 'weapon',
        rarity: 'rare',
        attackBonus: 12,
        defenseBonus: 0,
        healthBonus: 0,
        attackSpeedBonus: -0.8,
      }),
    );

    const profile = profiles.forHero(hero);
    expect(profile.attackSpeed).toBeGreaterThanOrEqual(0.35);
  });
});
