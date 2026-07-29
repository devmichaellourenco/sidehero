import { describe, expect, it, vi } from 'vitest';
import { UiOverlayOrchestrator, UI_OVERLAY_PRIORITY } from './UiOverlayOrchestrator';

describe('UiOverlayOrchestrator', () => {
  it('apresenta imediatamente quando livre', () => {
    const orch = new UiOverlayOrchestrator();
    const present = vi.fn();
    orch.request('wow', 'a', present);
    expect(present).toHaveBeenCalledTimes(1);
    expect(orch.getActiveKind()).toBe('wow');
  });

  it('enfileira pedido de menor prioridade até o ativo liberar', () => {
    const orch = new UiOverlayOrchestrator();
    const onboarding = vi.fn();
    const wow = vi.fn();

    orch.request('onboarding', 'tip-1', onboarding);
    orch.request('wow', 'wow-1', wow);

    expect(onboarding).toHaveBeenCalledTimes(1);
    expect(wow).not.toHaveBeenCalled();
    expect(orch.getActiveKind()).toBe('onboarding');

    orch.release('onboarding', 'tip-1');
    expect(wow).toHaveBeenCalledTimes(1);
    expect(orch.getActiveKind()).toBe('wow');
  });

  it('quando dois estão na fila, sobe o de maior prioridade', () => {
    const orch = new UiOverlayOrchestrator();
    const battle = vi.fn();
    const scene = vi.fn();
    const wow = vi.fn();

    orch.request('wow', 'holder', () => undefined);
    orch.request('battle_result', 'clear-1', battle);
    orch.request('act_scene', 'stendra-act-1', scene);
    orch.request('wow', 'wow-2', wow);

    expect(orch.getActiveKind()).toBe('wow');

    orch.release('wow', 'holder');
    expect(scene).toHaveBeenCalledTimes(1);
    expect(battle).not.toHaveBeenCalled();
    expect(UI_OVERLAY_PRIORITY.act_scene).toBeGreaterThan(UI_OVERLAY_PRIORITY.battle_result);

    orch.release('act_scene', 'stendra-act-1');
    expect(battle).toHaveBeenCalledTimes(1);

    orch.release('battle_result', 'clear-1');
    expect(wow).toHaveBeenCalledTimes(1);
  });

  it('não interrompe o ativo mesmo se chegar um de prioridade maior', () => {
    const orch = new UiOverlayOrchestrator();
    const wow = vi.fn();
    const onboarding = vi.fn();

    orch.request('wow', 'wow-1', wow);
    orch.request('onboarding', 'tip-1', onboarding);

    expect(wow).toHaveBeenCalledTimes(1);
    expect(onboarding).not.toHaveBeenCalled();
    expect(orch.getActiveKind()).toBe('wow');

    orch.release('wow', 'wow-1');
    expect(onboarding).toHaveBeenCalledTimes(1);
  });

  it('substitui present do mesmo id na fila', () => {
    const orch = new UiOverlayOrchestrator();
    const first = vi.fn();
    const second = vi.fn();

    orch.request('onboarding', 'busy', () => undefined);
    orch.request('wow', 'same', first);
    orch.request('wow', 'same', second);
    orch.release('onboarding', 'busy');

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('cancelKind remove da fila e libera se ativo', () => {
    const orch = new UiOverlayOrchestrator();
    const tip = vi.fn();
    const wow = vi.fn();

    orch.request('onboarding', 'tip-1', tip);
    orch.request('wow', 'wow-1', wow);
    orch.cancelKind('onboarding');

    expect(orch.getActiveKind()).toBe('wow');
    expect(wow).toHaveBeenCalledTimes(1);
  });

  it('notifica idle quando fila e ativo esvaziam', () => {
    const orch = new UiOverlayOrchestrator();
    const idle = vi.fn();
    orch.onIdle(idle);

    orch.request('wow', 'w1', () => undefined);
    orch.release('wow', 'w1');
    expect(idle).toHaveBeenCalledTimes(1);
  });
});
