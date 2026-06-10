import { describe, expect, it } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { shouldRenderHeroPanel } from './HeroPanelRenderPolicy';

function state(overrides: Partial<GameStateDto> = {}): GameStateDto {
  return {
    canEditParty: false,
    activePartyIds: ['h1'],
    heroes: [{ id: 'h1' } as GameStateDto['heroes'][0]],
    ...overrides,
  } as GameStateDto;
}

describe('shouldRenderHeroPanel', () => {
  it('pula re-render em combate quando só HP muda', () => {
    const previous = state({
      heroes: [{ id: 'h1', health: 80 } as GameStateDto['heroes'][0]],
    });
    const next = state({
      heroes: [{ id: 'h1', health: 40 } as GameStateDto['heroes'][0]],
    });

    expect(shouldRenderHeroPanel(previous, next)).toBe(false);
  });

  it('re-renderiza quando a party fica editável', () => {
    const previous = state({ canEditParty: false });
    const next = state({ canEditParty: true });

    expect(shouldRenderHeroPanel(previous, next)).toBe(true);
  });

  it('re-renderiza em combate quando a composição da party muda', () => {
    const previous = state({ activePartyIds: ['h1'] });
    const next = state({ activePartyIds: ['h1', 'h2'] });

    expect(shouldRenderHeroPanel(previous, next)).toBe(true);
  });
});
