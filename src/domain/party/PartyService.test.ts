import { describe, expect, it } from 'vitest';
import { PhaseRun } from '../campaign/PhaseRun';
import { CombatState } from '../entities/CombatState';
import { GameState } from '../entities/GameState';
import { HeroUnlockService } from './HeroUnlockService';
import { PartyService } from './PartyService';
import { TurnOrderService } from '../services/combat/TurnOrderService';

describe('PartyService', () => {
  const service = new PartyService();

  it('adiciona herói da reserva à party ativa', () => {
    let state = GameState.initial().withActivePartyIds(['hero-1', 'hero-2']);
    state = HeroUnlockService.applyUnlock(state, 'berserker');
    state = service.addToActiveParty(state, 'hero-berserker');
    expect(state.activePartyIds).toEqual(['hero-1', 'hero-2', 'hero-berserker']);
  });

  it('remove herói da party mantendo mínimo', () => {
    const state = GameState.initial().withActivePartyIds(['hero-1', 'hero-2']);
    const next = service.removeFromActiveParty(state, 'hero-2');
    expect(next.activePartyIds).toEqual(['hero-1']);
  });

  it('reordena membros da party ativa', () => {
    const state = GameState.initial().withActivePartyIds(['hero-1', 'hero-2', 'hero-3']);
    const next = service.moveActivePartyMember(state, 2, 0);
    expect(next.activePartyIds).toEqual(['hero-3', 'hero-1', 'hero-2']);
  });

  it('bloqueia edição durante combate', () => {
    const base = GameState.initial();
    const locked = base.withCombat(
      CombatState.start(base.activeHeroes(), [], new TurnOrderService(), null),
    );
    expect(() => service.addToActiveParty(locked, 'hero-1')).toThrow(
      'Party só pode ser editada fora de combate',
    );
  });

  it('bloqueia edição com phaseRun ativo', () => {
    const locked = GameState.initial().withPhaseRun(PhaseRun.start('1-1'));
    expect(() => service.removeFromActiveParty(locked, 'hero-3')).toThrow();
  });
});
