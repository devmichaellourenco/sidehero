import { describe, expect, it } from 'vitest';
import { rewardHeroPortraitFromClass, rewardHeroPortraitFromDto } from './RewardHeroPortrait';

describe('RewardHeroPortrait', () => {
  it('mapeia herói desbloqueado para portrait', () => {
    expect(rewardHeroPortraitFromDto({
      id: 'hero-berserker',
      heroClass: 'berserker',
      name: 'Ragnar',
    })).toEqual({
      id: 'hero-berserker',
      heroClass: 'berserker',
      name: 'Ragnar',
    });
  });

  it('resolve portrait por classe desbloqueável', () => {
    expect(rewardHeroPortraitFromClass('paladin')).toEqual({
      id: 'hero-paladin',
      heroClass: 'paladin',
      name: 'Valerius',
    });
  });
});
