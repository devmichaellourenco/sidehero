import { describe, expect, it } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { buildBattleStripStructureKey } from './BattleStripStructure';

function minimalState(overrides: Partial<GameStateDto> = {}): GameStateDto {
  return {
    activeParty: [{ id: 'h1' } as GameStateDto['activeParty'][0]],
    enemies: [{ id: 'e1' } as GameStateDto['enemies'][0]],
    phaseRun: null,
    combatIntermission: null,
    ...overrides,
  } as GameStateDto;
}

describe('buildBattleStripStructureKey', () => {
  it('muda quando a composição da party ou dos inimigos muda', () => {
    const base = minimalState();
    const swappedHero = minimalState({
      activeParty: [{ id: 'h2' } as GameStateDto['activeParty'][0]],
    });

    expect(buildBattleStripStructureKey(base)).not.toBe(buildBattleStripStructureKey(swappedHero));
  });

  it('permanece estável para o mesmo lineup', () => {
    const state = minimalState();
    expect(buildBattleStripStructureKey(state)).toBe(buildBattleStripStructureKey(state));
  });

  it('muda quando a ordem dos inimigos muda', () => {
    const first = minimalState({
      enemies: [{ id: 'e1' } as GameStateDto['enemies'][0], { id: 'e2' } as GameStateDto['enemies'][0]],
    });
    const swapped = minimalState({
      enemies: [{ id: 'e2' } as GameStateDto['enemies'][0], { id: 'e1' } as GameStateDto['enemies'][0]],
    });

    expect(buildBattleStripStructureKey(first)).not.toBe(buildBattleStripStructureKey(swapped));
  });
});
