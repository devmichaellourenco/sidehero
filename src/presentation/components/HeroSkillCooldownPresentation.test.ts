import { describe, expect, it } from 'vitest';
import { getSkillCooldownRatio } from './HeroSkillCooldownPresentation';

describe('getSkillCooldownRatio', () => {
  it('retorna 0 quando pronta', () => {
    expect(
      getSkillCooldownRatio({
        skillId: 'fireball',
        secondsRemaining: 0,
        cooldownTotal: 2,
        ready: true,
      }),
    ).toBe(0);
  });

  it('calcula proporção da recarga restante', () => {
    expect(
      getSkillCooldownRatio({
        skillId: 'fireball',
        secondsRemaining: 1,
        cooldownTotal: 2,
        ready: false,
      }),
    ).toBe(0.5);
  });
});
