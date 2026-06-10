import { GameState } from '../entities/GameState';
import { Hero } from '../entities/Hero';
import { HeroClass, UNLOCKABLE_HERO_CLASSES } from '../entities/HeroClass';

const UNLOCK_HERO_IDS: Record<(typeof UNLOCKABLE_HERO_CLASSES)[number], string> = {
  berserker: 'hero-berserker',
  paladin: 'hero-paladin',
};

const UNLOCK_HERO_NAMES: Record<(typeof UNLOCKABLE_HERO_CLASSES)[number], string> = {
  berserker: 'Ragnar',
  paladin: 'Seraphine',
};

export class HeroUnlockService {
  static isUnlocked(state: GameState, heroClass: HeroClass): boolean {
    return state.roster.some((hero) => hero.heroClass === heroClass);
  }

  static createUnlockedHero(heroClass: (typeof UNLOCKABLE_HERO_CLASSES)[number]): Hero {
    return Hero.createStarter(UNLOCK_HERO_IDS[heroClass], heroClass, UNLOCK_HERO_NAMES[heroClass]);
  }

  static applyUnlock(state: GameState, heroClass: HeroClass): GameState {
    if (!UNLOCKABLE_HERO_CLASSES.includes(heroClass as (typeof UNLOCKABLE_HERO_CLASSES)[number])) {
      throw new Error('Classe não desbloqueável via melhoria');
    }

    if (this.isUnlocked(state, heroClass)) {
      return state;
    }

    const hero = this.createUnlockedHero(heroClass as (typeof UNLOCKABLE_HERO_CLASSES)[number]);
    return state.withRoster([...state.roster, hero]).addLog(`Novo herói desbloqueado: ${hero.name}!`);
  }
}
