import { describe, expect, it } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { buildPendingActions } from './PendingActionsPolicy';

function mockState(overrides: Partial<GameStateDto> = {}): GameStateDto {
  return {
    pendingChestCount: 0,
    purchasableUpgradeCount: 0,
    heroes: [],
    inventory: [],
    ...overrides,
  } as GameStateDto;
}

describe('buildPendingActions', () => {
  it('rotula heróis com saldo como Aprimoramento', () => {
    const actions = buildPendingActions(
      mockState({
        heroes: [
          { id: 'h1', name: 'Nix', hasUnspentPoints: true },
          { id: 'h2', name: 'Elara', hasUnspentPoints: false },
        ] as GameStateDto['heroes'],
      }),
    );

    expect(actions).toEqual([{ kind: 'hero-points', label: 'Aprimoramento: Nix' }]);
  });
});
