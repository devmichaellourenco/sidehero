import { describe, expect, it } from 'vitest';
import { PhaseRun } from '../campaign/PhaseRun';
import { CombatState } from '../entities/CombatState';
import { GameState } from '../entities/GameState';
import { TurnOrderService } from '../services/combat/TurnOrderService';
import { PartyEditPolicy } from './PartyEditPolicy';

describe('PartyEditPolicy', () => {
  it('permite edição sem combate nem phaseRun', () => {
    expect(PartyEditPolicy.canEdit(GameState.initial())).toBe(true);
  });

  it('bloqueia edição com combate ativo', () => {
    const base = GameState.initial();
    const state = base.withCombat(
      CombatState.start(base.activeHeroes(), [], new TurnOrderService(), null),
    );
    expect(PartyEditPolicy.canEdit(state)).toBe(false);
  });

  it('bloqueia edição com phaseRun ativo', () => {
    const state = GameState.initial().withPhaseRun(PhaseRun.start('1-1'));
    expect(PartyEditPolicy.canEdit(state)).toBe(false);
  });

  it('assertEditable lança fora de combate', () => {
    expect(() => PartyEditPolicy.assertEditable(GameState.initial())).not.toThrow();
  });
});
