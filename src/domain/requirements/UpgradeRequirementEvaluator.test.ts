import { describe, expect, it } from 'vitest';
import { GameState } from '../entities/GameState';
import { UpgradeRequirementEvaluator } from './UpgradeRequirementEvaluator';

describe('UpgradeRequirementEvaluator', () => {
  const evaluator = new UpgradeRequirementEvaluator();

  it('valida requisito de stage mínimo', () => {
    const state = GameState.restore({
      ...GameState.initial().toProps(),
      stage: 5,
    });

    expect(evaluator.allMet(state, [{ type: 'min_stage', value: 3 }])).toBe(true);
    expect(evaluator.allMet(state, [{ type: 'min_stage', value: 10 }])).toBe(false);
  });

  it('valida requisito de vitórias', () => {
    const state = GameState.restore({
      ...GameState.initial().toProps(),
      totalBattlesWon: 12,
    });

    const results = evaluator.evaluateAll(state, [{ type: 'min_battles_won', value: 10 }]);
    expect(results[0]?.met).toBe(true);
    expect(results[0]?.label).toBe('10 vitórias');
  });
});
