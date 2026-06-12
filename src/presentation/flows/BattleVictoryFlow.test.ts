import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AUTO_DISMISS_MS, BattleVictoryFlow } from './BattleVictoryFlow';
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
      if (selector === '[data-victory-continue]') {
        return {
          addEventListener: (event: string, listener: EventListener) => {
            listeners.set(`continue:${event}`, listener);
          },
          click: () => listeners.get('continue:click')?.(new Event('click')),
        };
      }
      if (selector === '[data-victory-countdown]') {
        return { textContent: '' };
      }
      return null;
    },
    clickContinue() {
      listeners.get('continue:click')?.(new Event('click'));
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
          '<button data-victory-details-toggle></button><div data-victory-details-panel class="hidden"></div>';
      },
    };

    return new BattleVictoryFlow(
      overlay as unknown as HTMLElement,
      strip as unknown as HTMLElement,
      renderer as never,
    );
  }

  it('não bloqueia avanço do jogo', () => {
    const flow = createFlow();
    flow.show(basePayload());

    expect(flow.isBlockingAdvance()).toBe(false);
    expect(flow.isActive()).toBe(true);
  });

  it('fecha automaticamente sem retomar campanha', () => {
    const flow = createFlow();
    const onChest = vi.fn();

    flow.show(basePayload(), onChest);
    vi.advanceTimersByTime(AUTO_DISMISS_MS);

    expect(flow.isActive()).toBe(false);
    expect(onChest).toHaveBeenCalledTimes(1);
  });

  it('fecha ao clicar em continuar', () => {
    const flow = createFlow();
    flow.show(basePayload());
    vi.advanceTimersByTime(AUTO_DISMISS_MS);

    expect(flow.isActive()).toBe(false);
  });
});
