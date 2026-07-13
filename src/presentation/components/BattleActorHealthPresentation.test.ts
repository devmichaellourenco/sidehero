import { describe, expect, it } from 'vitest';
import { renderStripActorBars } from './BattleActorHealthPresentation';

describe('renderStripActorBars', () => {
  it('renderiza barra de vida e barra de tempo de ação', () => {
    const html = renderStripActorBars({
      side: 'hero',
      healthLabel: '80/100',
      healthPercent: 80,
      actionTimeRatio: 0.4,
    });

    expect(html).toContain('strip-actor-bars');
    expect(html).toContain('data-action-time-bar');
    expect(html).toContain('width: 40%');
  });
});
