import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { OVERLAY_ANIMATION_MS, BattleVictoryFlow } from './BattleVictoryFlow';
import { BattleVictoryPayload } from '../components/BattleVictoryDetector';

function basePayload(overrides: Partial<BattleVictoryPayload> = {}): BattleVictoryPayload {
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
    milestoneVictory: null,
    defeatHint: null,
    ...overrides,
  };
}

function createMockElement() {
  const classes = new Set<string>();
  let html = '';
  const listeners = new Map<string, EventListener>();
  const panelClasses = new Set<string>(['hidden']);
  const continueClasses = new Set<string>(['hidden']);

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
          textContent: 'Detalhes',
          setAttribute() {},
          addEventListener: (event: string, listener: EventListener) => {
            listeners.set(`details:${event}`, listener);
          },
        };
      }
      if (selector === '[data-victory-details-panel]') {
        return {
          classList: {
            toggle: (item: string) => {
              if (panelClasses.has(item)) {
                panelClasses.delete(item);
                return false;
              }
              panelClasses.add(item);
              return true;
            },
            remove: (...items: string[]) => items.forEach((item) => panelClasses.delete(item)),
            contains: (item: string) => panelClasses.has(item),
          },
        };
      }
      if (selector === '[data-victory-continue]') {
        return {
          classList: {
            remove: (...items: string[]) => items.forEach((item) => continueClasses.delete(item)),
            contains: (item: string) => continueClasses.has(item),
          },
          addEventListener: (event: string, listener: EventListener) => {
            listeners.set(`continue:${event}`, listener);
          },
        };
      }
      return null;
    },
    emitLabelAnimationEnd() {
      listeners.get('label:animationend')?.(new Event('animationend'));
    },
    clickContinue() {
      listeners.get('continue:click')?.(new Event('click'));
    },
    isPanelHidden() {
      return panelClasses.has('hidden');
    },
    isContinueHidden() {
      return continueClasses.has('hidden');
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
          '<span class="battle-victory-compact-label"></span><button data-victory-details-toggle></button><div data-victory-details-panel class="hidden"></div><button data-victory-continue class="hidden"></button>';
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

  it('no clear final revela detalhes após animação e só fecha no Continuar', () => {
    const flow = createFlow();
    const onDismiss = vi.fn();

    flow.show(basePayload(), onDismiss);
    overlay.emitLabelAnimationEnd();

    expect(flow.isActive()).toBe(true);
    expect(onDismiss).not.toHaveBeenCalled();
    expect(overlay.isPanelHidden()).toBe(false);
    expect(overlay.isContinueHidden()).toBe(false);

    overlay.clickContinue();
    expect(flow.isActive()).toBe(false);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('no defeat revela detalhes após timeout e aguarda Continuar', () => {
    const flow = createFlow();
    const onDismiss = vi.fn();

    flow.show(basePayload({ variant: 'defeat', nextPhaseName: null, nextPhaseId: null }), onDismiss);
    vi.advanceTimersByTime(OVERLAY_ANIMATION_MS + 300);

    expect(flow.isActive()).toBe(true);
    expect(onDismiss).not.toHaveBeenCalled();
    expect(overlay.isPanelHidden()).toBe(false);

    overlay.clickContinue();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('wave-clear ainda fecha automaticamente após animação', () => {
    const flow = createFlow();
    const onDismiss = vi.fn();

    flow.show(basePayload({ variant: 'wave-clear' }), onDismiss);
    overlay.emitLabelAnimationEnd();

    expect(flow.isActive()).toBe(false);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
