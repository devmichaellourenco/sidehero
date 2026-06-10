import { describe, expect, it } from 'vitest';
import { Hero } from './Hero';
import { GameState } from './GameState';

describe('GameState party', () => {
  it('inicializa roster com starters e party ativa completa', () => {
    const state = GameState.initial();
    expect(state.roster).toHaveLength(3);
    expect(state.activePartyIds).toEqual(['hero-1', 'hero-2', 'hero-3']);
    expect(state.activeHeroes()).toHaveLength(3);
    expect(state.benchHeroes()).toHaveLength(0);
  });

  it('activeHeroes respeita ordem de activePartyIds', () => {
    const state = GameState.initial().withActivePartyIds(['hero-3', 'hero-1']);
    expect(state.activeHeroes().map((hero) => hero.id)).toEqual(['hero-3', 'hero-1']);
    expect(state.benchHeroes()).toHaveLength(1);
    expect(state.benchHeroes()[0].id).toBe('hero-2');
  });

  it('withRosterHeroes mescla updates sem remover reserva', () => {
    const state = GameState.initial().withActivePartyIds(['hero-1', 'hero-2']);
    const wounded = Hero.restore({
      ...state.roster[0].toProps(),
      currentHealth: 1,
    });

    const next = state.withRosterHeroes([wounded]);
    expect(next.roster).toHaveLength(3);
    expect(next.roster[0].currentHealth).toBe(1);
    expect(next.activePartyIds).toEqual(['hero-1', 'hero-2']);
  });

  it('heroes getter permanece alias do roster', () => {
    const state = GameState.initial();
    expect(state.heroes).toBe(state.roster);
  });

  it('restore normaliza saves legados sem activePartyIds', () => {
    const initial = GameState.initial();
    const legacy = GameState.restore({
      heroes: initial.roster,
      combat: null,
      campaignProgress: initial.campaignProgress.toProps(),
      phaseRun: null,
      stage: 1,
      gold: 0,
      chests: [],
      inventory: [],
      battleLog: [],
      totalBattlesWon: 0,
      lastTickAt: Date.now(),
      shopRefreshSeed: 0,
      upgradeLevels: {},
      shopRefreshUses: 0,
    });

    expect(legacy.activePartyIds).toEqual(['hero-1', 'hero-2', 'hero-3']);
    expect(legacy.activeHeroes()).toHaveLength(3);
  });
});
