import { describe, expect, it } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { buildBattleStripStructureKey } from './BattleStripStructure';

function minimalState(overrides: Partial<GameStateDto> = {}): GameStateDto {
  return {
    activeParty: [{ id: 'h1' } as GameStateDto['activeParty'][0]],
    enemies: [{ id: 'e1' } as GameStateDto['enemies'][0]],
    phaseRun: null,
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
});
