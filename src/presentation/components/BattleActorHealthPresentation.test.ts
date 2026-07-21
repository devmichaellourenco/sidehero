// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import {
  clearActionTimeAnimationStamp,
  patchActionTimeBar,
  renderStripActorBars,
} from './BattleActorHealthPresentation';

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

describe('patchActionTimeBar', () => {
  it('remove stamps de animação quando congelado sem alterar largura', () => {
    document.body.innerHTML = `
      <div class="battle-actor-card">
        <div data-action-time-bar data-at-remaining="1" data-at-total="2" data-at-captured-at="0">
          <div class="action-time-fill" style="width:10%"></div>
        </div>
      </div>
    `;
    const card = document.body.querySelector('.battle-actor-card') as HTMLElement;
    patchActionTimeBar(card, 0.5, 1, 2, true);
    const bar = card.querySelector('[data-action-time-bar]') as HTMLElement;
    expect(bar.dataset.atRemaining).toBeUndefined();
    expect((bar.querySelector('.action-time-fill') as HTMLElement).style.width).toBe('10%');
    clearActionTimeAnimationStamp(bar);
  });

  it('aplica largura do DTO quando congelado com applyWidth', () => {
    document.body.innerHTML = `
      <div class="battle-actor-card">
        <div data-action-time-bar data-at-remaining="1" data-at-total="2" data-at-captured-at="0">
          <div class="action-time-fill" style="width:10%"></div>
        </div>
      </div>
    `;
    const card = document.body.querySelector('.battle-actor-card') as HTMLElement;
    patchActionTimeBar(card, 1, 0, 0, true, true);
    const bar = card.querySelector('[data-action-time-bar]') as HTMLElement;
    expect(bar.dataset.atRemaining).toBeUndefined();
    expect((bar.querySelector('.action-time-fill') as HTMLElement).style.width).toBe('100%');
  });
});
