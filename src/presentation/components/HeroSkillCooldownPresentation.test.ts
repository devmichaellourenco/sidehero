import { describe, expect, it } from 'vitest';
import { formatSkillCooldownCountdown } from '../../domain/combat/SkillCooldownTiming';
import { getSkillCooldownRatio, renderSkillCooldownOverlay } from './HeroSkillCooldownPresentation';

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

describe('renderSkillCooldownOverlay', () => {
  it('exibe contagem inteira arredondada para cima', () => {
    const html = renderSkillCooldownOverlay({
      skillId: 'fireball',
      secondsRemaining: 0.75,
      cooldownTotal: 2,
      ready: false,
    });

    expect(html).toContain('>1<');
    expect(html).not.toContain('0.7');
  });
});

describe('formatSkillCooldownCountdown', () => {
  it('re-exporta comportamento do domínio', () => {
    expect(formatSkillCooldownCountdown(0.75)).toBe('1');
  });
});
