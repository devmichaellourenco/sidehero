import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AUTO_CONTINUE_MS, BattleVictoryFlow } from './BattleVictoryFlow';
import { BattleVictoryPayload } from '../components/BattleVictoryDetector';

function basePayload(): BattleVictoryPayload {
  return {
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
    classListSet: classes,
    querySelector(selector: string) {
      if (selector === '[data-victory-adjust]') {
        return {
          addEventListener: (event: string, listener: EventListener) => {
            listeners.set(`adjust:${event}`, listener);
          },
          click: () => listeners.get('adjust:click')?.(new Event('click')),
        };
      }
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
    clickAdjust() {
      listeners.get('adjust:click')?.(new Event('click'));
    },
    clickContinue() {
      listeners.get('continue:click')?.(new Event('click'));
    },
  };
}

describe('BattleVictoryFlow', () => {
  let overlay: ReturnType<typeof createMockElement>;
  let strip: ReturnType<typeof createMockElement>;
  let onContinue: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    overlay = createMockElement();
    strip = createMockElement();
    onContinue = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createFlow() {
    const renderer = {
      render: (container: { innerHTML: string }) => {
        container.innerHTML = '<button data-victory-adjust></button><button data-victory-continue></button><p data-victory-countdown></p>';
      },
    };

    return new BattleVictoryFlow(
      overlay as unknown as HTMLElement,
      strip as unknown as HTMLElement,
      renderer as never,
      onContinue,
    );
  }

  it('avança automaticamente após o countdown', () => {
    const flow = createFlow();
    flow.show(basePayload());

    expect(flow.isBlockingAdvance()).toBe(true);
    vi.advanceTimersByTime(AUTO_CONTINUE_MS);

    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(flow.isBlockingAdvance()).toBe(false);
  });

  it('pausa countdown e entra em intermissão ao ajustar party', () => {
    const flow = createFlow();
    const onIntermissionStart = vi.fn();

    flow.show(basePayload(), undefined, { onIntermissionStart });
    overlay.clickAdjust();

    expect(onIntermissionStart).toHaveBeenCalledTimes(1);
    expect(flow.isIntermissionPause()).toBe(true);
    expect(flow.isActive()).toBe(false);
    expect(onContinue).not.toHaveBeenCalled();

    vi.advanceTimersByTime(AUTO_CONTINUE_MS);
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('retoma batalha ao continuar depois da intermissão', () => {
    const flow = createFlow();
    const onIntermissionEnd = vi.fn();

    flow.show(basePayload(), undefined, {
      onIntermissionStart: vi.fn(),
      onIntermissionEnd,
    });
    overlay.clickAdjust();
    flow.dismiss();

    expect(onIntermissionEnd).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(flow.isBlockingAdvance()).toBe(false);
  });
});
