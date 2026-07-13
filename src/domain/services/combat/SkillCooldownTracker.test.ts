import { describe, expect, it } from 'vitest';
import { CombatSkillDefinition } from '../../progression/combat/CombatSkillDefinition';
import { SkillCooldownTracker } from './SkillCooldownTracker';

const TEST_SKILL: CombatSkillDefinition = {
  skillId: 'test_bolt',
  name: 'Raio de Teste',
  cooldownSeconds: 10,
  cooldownTurns: 0,
  initialCooldown: 0,
  initialCooldownSeconds: 0,
  target: 'enemy',
  kind: 'damage',
  delivery: 'spell',
  element: 'lightning',
  basePower: 20,
  scaling: { int: 1 },
};

describe('SkillCooldownTracker', () => {
  it('aplica redução de recarga como percentual do tempo base', () => {
    const key = 'hero:h1';
    const tracker = SkillCooldownTracker.fromMap({ [key]: {} });
    const withCdr = tracker.onSkillUsed(key, 'test_bolt', [TEST_SKILL], 0.3);

    expect(withCdr.getRemaining(key, 'test_bolt')).toBe(7);
  });

  it('mantém cooldown integral sem redução de recarga', () => {
    const key = 'hero:h1';
    const tracker = SkillCooldownTracker.fromMap({ [key]: {} });
    const applied = tracker.onSkillUsed(key, 'test_bolt', [TEST_SKILL], 0);

    expect(applied.getRemaining(key, 'test_bolt')).toBe(10);
  });
});
