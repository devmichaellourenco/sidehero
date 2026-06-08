import { describe, expect, it } from 'vitest';
import { Hero } from '../../entities/Hero';
import { listHeroCombatSkills } from './HeroCombatSkillCatalog';

describe('listHeroCombatSkills', () => {
  it('só retorna skills equipadas com rank, sem fallback implícito', () => {
    const hero = Hero.restore({
      ...Hero.createStarter('h1', 'knight', 'Arthos').toProps(),
      skillRanks: { basic_attack: 1 },
      equippedSkillIds: ['basic_attack'],
    });

    expect(listHeroCombatSkills(hero).map((skill) => skill.skillId)).toEqual(['basic_attack']);
  });

  it('ignora skills equipadas sem rank', () => {
    const hero = Hero.restore({
      ...Hero.createStarter('h1', 'sorcerer', 'Lyra').toProps(),
      skillRanks: { basic_attack: 1 },
      equippedSkillIds: ['basic_attack', 'fireball'],
    });

    expect(listHeroCombatSkills(hero).map((skill) => skill.skillId)).toEqual(['basic_attack']);
  });
});
