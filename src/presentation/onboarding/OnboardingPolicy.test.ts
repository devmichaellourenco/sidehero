import { describe, expect, it } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import {
  isOnboardingComplete,
  isOnboardingStepTriggered,
  ONBOARDING_STEP_ORDER,
  resolveOnboardingStep,
} from './OnboardingPolicy';

function mockState(overrides: Partial<GameStateDto> = {}): GameStateDto {
  return {
    pendingChestCount: 0,
    canEditParty: false,
    phaseRun: { phaseId: '1-1' },
    heroes: [{ id: 'h1', hasUnspentPoints: false } as GameStateDto['heroes'][number]],
    purchasableUpgradeCount: 0,
    ...overrides,
  } as GameStateDto;
}

describe('OnboardingPolicy', () => {
  it('prioriza primeiro baú quando há baús pendentes', () => {
    const step = resolveOnboardingStep(mockState({ pendingChestCount: 1 }), new Set());
    expect(step?.id).toBe('first-chest');
  });

  it('mostra pausa após dispensar baú', () => {
    const dismissed = new Set(['first-chest'] as const);
    const step = resolveOnboardingStep(mockState({ pendingChestCount: 0 }), dismissed);
    expect(step?.id).toBe('pause-loadout');
  });

  it('detecta Aprimoramento pendente', () => {
    const dismissed = new Set(['first-chest', 'pause-loadout'] as const);
    const step = resolveOnboardingStep(
      mockState({
        heroes: [{ id: 'h1', hasUnspentPoints: true } as GameStateDto['heroes'][number]],
      }),
      dismissed,
    );
    expect(step?.id).toBe('hero-points');
  });

  it('detecta melhoria disponível', () => {
    const dismissed = new Set(['first-chest', 'pause-loadout', 'hero-points'] as const);
    const step = resolveOnboardingStep(mockState({ purchasableUpgradeCount: 1 }), dismissed);
    expect(step?.id).toBe('first-upgrade');
  });

  it('marca onboarding completo quando todos os passos foram dispensados', () => {
    expect(isOnboardingComplete(new Set(ONBOARDING_STEP_ORDER))).toBe(true);
  });

  it('aciona gatilhos individuais', () => {
    expect(isOnboardingStepTriggered('first-chest', mockState({ pendingChestCount: 2 }))).toBe(true);
    expect(isOnboardingStepTriggered('hero-points', mockState({
      heroes: [{ hasUnspentPoints: true } as GameStateDto['heroes'][number]],
    }))).toBe(true);
  });
});
