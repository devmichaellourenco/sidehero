import { describe, expect, it } from 'vitest';
import { isSidePanelEligibleUrl } from './SidePanelLifecycle';

describe('isSidePanelEligibleUrl', () => {
  it('aceita URLs web normais', () => {
    expect(isSidePanelEligibleUrl('https://www.youtube.com/watch?v=abc')).toBe(true);
    expect(isSidePanelEligibleUrl('http://localhost:3000/')).toBe(true);
  });

  it('rejeita URLs internas do navegador', () => {
    expect(isSidePanelEligibleUrl('chrome://extensions/')).toBe(false);
    expect(isSidePanelEligibleUrl('chrome-extension://abc/panel.html')).toBe(false);
    expect(isSidePanelEligibleUrl(undefined)).toBe(false);
  });
});
