import { describe, expect, it } from 'vitest';
import { Hero } from '../entities/Hero';
import { Gear } from '../entities/Gear';
import { GALNEON_HERO_ID, GALNEON_STANDARD_SWORD_TEMPLATE_ID } from '../gear/GalneonGearCatalog';
import { LootService } from './LootService';
import { ShopService } from './ShopService';
import { GearRequirementChecker } from './GearRequirementChecker';

describe('Galneon — Espada Padrão', () => {
  const lootService = new LootService();
  const shopService = new ShopService(lootService);
  const checker = new GearRequirementChecker();

  it('gera cinco ofertas da espada padrão na loja', () => {
    const offers = shopService.generateOffers(10, 0);
    const swords = offers.filter(
      (offer) => offer.gear.templateId === GALNEON_STANDARD_SWORD_TEMPLATE_ID,
    );

    expect(swords).toHaveLength(5);
    expect(swords.map((offer) => offer.gear.rarity)).toEqual([
      'common',
      'uncommon',
      'rare',
      'epic',
      'legendary',
    ]);
  });

  it('só Galneon pode equipar a espada padrão', () => {
    const gear = lootService.generateGearFromTemplate(
      GALNEON_STANDARD_SWORD_TEMPLATE_ID,
      1,
      'common',
      'test-sword',
    );
    const galneon = Hero.createStarter(GALNEON_HERO_ID, 'knight', 'Galneon');
    const nix = Hero.createStarter('hero-2', 'sorcerer', 'Nix');

    expect(checker.meets(galneon, gear)).toBe(true);
    expect(checker.meets(nix, gear)).toBe(false);
    expect(gear.requirements.heroId).toBe(GALNEON_HERO_ID);
  });
});
