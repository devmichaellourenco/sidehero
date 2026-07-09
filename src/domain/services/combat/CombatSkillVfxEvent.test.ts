import { describe, expect, it } from 'vitest';
import { CombatAction } from './CombatAction';
import { createSkillVfxEvent } from './CombatSkillVfxEvent';

describe('createSkillVfxEvent', () => {
  it('ignora auto-ataque', () => {
    const action: CombatAction = {
      skillId: 'basic_attack',
      skillName: 'Ataque',
      kind: 'damage',
      targeting: 'single_enemy',
      power: 5,
      targetEnemyId: 'e1',
    };

    expect(createSkillVfxEvent('basic_attack', 'hero', 'h1', action)).toBeNull();
  });

  it('cria projétil para fireball em inimigo', () => {
    const action: CombatAction = {
      skillId: 'fireball',
      skillName: 'Bola de Fogo',
      kind: 'damage',
      targeting: 'single_enemy',
      power: 20,
      targetEnemyId: 'e1',
      damageComponents: [{ element: 'fire', delivery: 'projectile', weight: 1 }],
    };

    expect(createSkillVfxEvent('fireball', 'hero', 'h1', action)).toEqual({
      skillId: 'fireball',
      vfxKind: 'projectile',
      attackerSide: 'hero',
      attackerId: 'h1',
      targetSide: 'enemy',
      targetId: 'e1',
    });
  });
});
