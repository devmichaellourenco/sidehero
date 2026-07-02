import { describe, expect, it, vi } from 'vitest';
import { bindBattleChromeLayout, formatPanelSheetTop } from './BattleChromeLayout';

describe('BattleChromeLayout', () => {
  it('arredonda o topo do limite para cima', () => {
    expect(formatPanelSheetTop(212.4)).toBe('213px');
    expect(formatPanelSheetTop(-4)).toBe('0px');
  });

  it('registra e remove observadores ao desmontar', () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const boundary = { getBoundingClientRect: () => ({ top: 120 }) } as HTMLElement;

    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(() => ({ observe, disconnect })),
    );
    vi.stubGlobal('document', {
      documentElement: { style: { setProperty: vi.fn() } },
    });
    vi.stubGlobal('window', { addEventListener, removeEventListener });

    const unbind = bindBattleChromeLayout(boundary);
    expect(observe).toHaveBeenCalledWith(boundary);

    unbind();
    expect(disconnect).toHaveBeenCalled();
    expect(removeEventListener).toHaveBeenCalled();
  });
});
