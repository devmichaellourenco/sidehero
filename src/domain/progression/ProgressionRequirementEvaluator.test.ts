import { describe, expect, it } from 'vitest';
import { Hero } from '../entities/Hero';
import { ProgressionRequirementEvaluator } from './ProgressionRequirementEvaluator';

describe('ProgressionRequirementEvaluator', () => {
  const evaluator = new ProgressionRequirementEvaluator();

  it('valida requisito de classe', () => {
    const hero = Hero.createStarter('h1', 'priest', 'Elara');
    expect(
      evaluator.isMet(hero, { type: 'hero_class', heroClass: 'priest' }),
    ).toBe(true);
    expect(
      evaluator.isMet(hero, { type: 'hero_class', heroClass: 'knight' }),
    ).toBe(false);
  });

  it('valida requisito de atributo', () => {
    const hero = Hero.createStarter('h1', 'sorcerer', 'Lyra');
    expect(
      evaluator.isMet(hero, { type: 'attribute', key: 'int', min: 12 }),
    ).toBe(true);
    expect(
      evaluator.isMet(hero, { type: 'attribute', key: 'str', min: 20 }),
    ).toBe(false);
  });
});
