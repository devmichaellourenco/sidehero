import { describe, expect, it } from 'vitest';
import { GameState } from '../entities/GameState';
import { HeroUnlockService } from './HeroUnlockService';

describe('HeroUnlockService', () => {
  it('adiciona berserker ao roster na primeira vez', () => {
    const next = HeroUnlockService.applyUnlock(GameState.initial(), 'berserker');
    expect(next.roster).toHaveLength(4);
    expect(next.roster.some((hero) => hero.heroClass === 'berserker')).toBe(true);
    expect(next.activePartyIds).toEqual(['hero-1', 'hero-2', 'hero-3']);
    expect(next.benchHeroes()).toHaveLength(1);
  });

  it('não duplica herói já desbloqueado', () => {
    const once = HeroUnlockService.applyUnlock(GameState.initial(), 'paladin');
    const twice = HeroUnlockService.applyUnlock(once, 'paladin');
    expect(twice.roster.filter((hero) => hero.heroClass === 'paladin')).toHaveLength(1);
  });
});
