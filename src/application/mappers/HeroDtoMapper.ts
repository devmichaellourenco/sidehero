import { Hero } from '../../domain/entities/Hero';
import { AttributesDto } from '../dto/AttributesDto';
import { HeroDto } from '../dto/GameStateDto';

function mapAttributes(attrs: { str: number; dex: number; int: number }): AttributesDto {
  return { str: attrs.str, dex: attrs.dex, int: attrs.int };
}

export function mapHeroToDto(hero: Hero): HeroDto {
  const equipment: HeroDto['equipment'] = {};
  const slots = ['weapon', 'armor', 'accessory'] as const;
  const props = hero.toProps();
  const heroEquipment = props.equipment ?? {};

  for (const slot of slots) {
    const gear = heroEquipment[slot];
    equipment[slot] = gear
      ? {
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
        }
      : null;
  }

  return {
    id: hero.id,
    name: hero.name,
    heroClass: hero.heroClass,
    emoji: hero.emoji,
    level: hero.level,
    experience: props.experience.current,
    experienceToNextLevel: props.experience.toNextLevel,
    attack: hero.attack,
    defense: hero.defense,
    health: hero.currentHealth,
    maxHealth: hero.maxHealth,
    baseAttributes: mapAttributes(hero.baseAttributes),
    allocatedAttributes: mapAttributes(props.allocatedAttributes),
    totalAttributes: mapAttributes(hero.totalAttributes),
    unspentImprovementPoints: props.unspentImprovementPoints,
    unspentAscensionPoints: props.unspentAscensionPoints,
    skillRanks: { ...props.skillRanks },
    equippedSkillIds: [...props.equippedSkillIds],
    ascensionId: props.ascensionId,
    hasUnspentPoints: hero.hasUnspentPoints,
    equipment,
  };
}
