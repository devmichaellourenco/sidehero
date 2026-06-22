import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { OVERLAY_ANIMATION_MS, BattleVictoryFlow } from './BattleVictoryFlow';
import { BattleVictoryPayload } from '../components/BattleVictoryDetector';

function basePayload(): BattleVictoryPayload {
  return {
    variant: 'phase-clear',
    clearedPhaseId: '1-1',
    clearedPhaseName: 'Fase 1-1',
    nextPhaseName: 'Fase 1-2',
    nextPhaseId: '1-2',
    goldGained: 10,
    xpGained: 20,
    tierReached: null,
    chestDropped: false,
    chestCount: 0,
    seasonCompleted: false,
    heroRewards: [],
  };
}

function createMockElement() {
  const classes = new Set<string>();
  let html = '';
  const listeners = new Map<string, EventListener>();

  return {
    classList: {
      add: (...items: string[]) => items.forEach((item) => classes.add(item)),
      remove: (...items: string[]) => items.forEach((item) => classes.delete(item)),
      contains: (item: string) => classes.has(item),
    },
    get innerHTML() {
      return html;
    },
    set innerHTML(value: string) {
      html = value;
    },
    querySelector(selector: string) {
      if (selector === '.battle-victory-compact-label') {
        return {
          addEventListener: (event: string, listener: EventListener) => {
            listeners.set(`label:${event}`, listener);
          },
        };
      }
      if (selector === '[data-victory-details-toggle]') {
        return {
          addEventListener: (event: string, listener: EventListener) => {
            listeners.set(`details:${event}`, listener);
          },
        };
      }
      if (selector === '[data-victory-details-panel]') {
        return { classList: { toggle: () => false } };
      }
      return null;
    },
    emitLabelAnimationEnd() {
      listeners.get('label:animationend')?.(new Event('animationend'));
    },
  };
}

describe('BattleVictoryFlow', () => {
  let overlay: ReturnType<typeof createMockElement>;
  let strip: ReturnType<typeof createMockElement>;

  beforeEach(() => {
    vi.useFakeTimers();
    overlay = createMockElement();
    strip = createMockElement();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createFlow() {
    const renderer = {
      render: (container: { innerHTML: string }) => {
        container.innerHTML =
          '<span class="battle-victory-compact-label"></span><button data-victory-details-toggle></button><div data-victory-details-panel class="hidden"></div>';
      },
    };

    return new BattleVictoryFlow(
      overlay as unknown as HTMLElement,
      strip as unknown as HTMLElement,
      renderer as never,
    );
  }

  it('bloqueia avanço enquanto overlay está visível', () => {
    const flow = createFlow();
    flow.show(basePayload());

    expect(flow.isBlockingAdvance()).toBe(true);
    expect(flow.isActive()).toBe(true);
  });

  it('fecha após animação e chama callback de retomada', () => {
    const flow = createFlow();
    const onDismiss = vi.fn();

    flow.show(basePayload(), onDismiss);
    overlay.emitLabelAnimationEnd();

    expect(flow.isActive()).toBe(false);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('fecha automaticamente após timeout de fallback', () => {
    const flow = createFlow();
    const onDismiss = vi.fn();

    flow.show(basePayload(), onDismiss);
    vi.advanceTimersByTime(OVERLAY_ANIMATION_MS + 300);

    expect(flow.isActive()).toBe(false);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
