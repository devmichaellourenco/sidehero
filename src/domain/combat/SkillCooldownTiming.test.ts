import { describe, expect, it } from 'vitest';
import { formatSkillCooldownCountdown } from './SkillCooldownTiming';

describe('formatSkillCooldownCountdown', () => {
  it('arredonda frações para cima', () => {
    expect(formatSkillCooldownCountdown(0.75)).toBe('1');
    expect(formatSkillCooldownCountdown(0.1)).toBe('1');
    expect(formatSkillCooldownCountdown(1.2)).toBe('2');
  });

  it('exibe inteiros exatos', () => {
    expect(formatSkillCooldownCountdown(3)).toBe('3');
    expect(formatSkillCooldownCountdown(1)).toBe('1');
  });

  it('exibe 0 quando a recarga zerou', () => {
    expect(formatSkillCooldownCountdown(0)).toBe('0');
  });
});
