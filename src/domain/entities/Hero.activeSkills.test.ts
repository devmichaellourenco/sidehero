import { describe, expect, it } from 'vitest';
import { BASIC_ATTACK_SKILL_ID } from '../progression/combat/BasicAttackSkill';
import { MAX_ACTIVE_BATTLE_SKILLS } from '../progression/SkillBattleSlots';
import { Hero } from './Hero';

function heroWithSkills(equippedSkillIds: string[], skillRanks: Record<string, number> = {}): Hero {
  const base = Hero.createStarter('hero-1', 'knight', 'Test');
  const ranks = {
    [BASIC_ATTACK_SKILL_ID]: 1,
    power_attack: 1,
    evasion: 1,
    arcane_touch: 1,
    vitality: 1,
    ...skillRanks,
  };

  return Hero.restore({
    ...base.toProps(),
    skillRanks: ranks,
    equippedSkillIds,
  });
}

describe('Hero.activateSkill', () => {
  it('herói inicial já vem com ataque básico ativo', () => {
    const hero = Hero.createStarter('hero-1', 'knight', 'Test');

    expect(hero.toProps().skillRanks.basic_attack).toBe(1);
    expect(hero.toProps().equippedSkillIds).toEqual(['basic_attack']);
  });

  it('permite até 3 skills ativas quando há slots desbloqueados', () => {
    let hero = heroWithSkills(['basic_attack']);
    hero = hero.activateSkill('power_attack', 3);
    hero = hero.activateSkill('evasion', 3);

    expect(hero.toProps().equippedSkillIds).toHaveLength(MAX_ACTIVE_BATTLE_SKILLS);
  });

  it('rejeita skill além do limite de slots desbloqueados', () => {
    let hero = heroWithSkills(['basic_attack']);

    expect(() => hero.activateSkill('power_attack', 1)).toThrow('Limite de 1 skills ativas na batalha');
  });

  it('rejeita a 4ª skill ativa', () => {
    const hero = heroWithSkills(['basic_attack', 'power_attack', 'evasion']);

    expect(() => hero.activateSkill('arcane_touch', 3)).toThrow(
      `Limite de ${MAX_ACTIVE_BATTLE_SKILLS} skills ativas na batalha`,
    );
  });

  it('não permite desativar ataque básico', () => {
    const hero = Hero.createStarter('hero-1', 'knight', 'Test');

    expect(() => hero.deactivateSkill('basic_attack')).toThrow('Ataque Básico não pode ser desativado');
  });
});
