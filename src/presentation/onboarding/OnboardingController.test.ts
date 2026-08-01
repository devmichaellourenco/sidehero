// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { OnboardingController } from './OnboardingController';

describe('OnboardingController spotlight', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('abre recorte de spotlight sobre o âncora destacado', () => {
    const anchor = document.createElement('button');
    anchor.id = 'tutorial-target';
    anchor.textContent = 'Alvo';
    document.body.appendChild(anchor);
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      top: 40,
      left: 20,
      bottom: 80,
      right: 120,
      width: 100,
      height: 40,
      x: 20,
      y: 40,
      toJSON: () => ({}),
    });

    const controller = new OnboardingController();
    controller.show(
      {
        id: 'welcome',
        title: 'Bem-vindo',
        message: 'Clique aqui',
        anchorSelector: '#tutorial-target',
      },
      { onDismissStep: vi.fn(), onSkipAll: vi.fn() },
    );

    // reposition usa rAF
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        const spotlight = document.querySelector('.onboarding-spotlight') as HTMLElement;
        const backdrop = document.querySelector('.onboarding-backdrop') as HTMLElement;

        expect(spotlight.classList.contains('hidden')).toBe(false);
        expect(backdrop.classList.contains('onboarding-backdrop--cutout')).toBe(true);
        expect(anchor.classList.contains('onboarding-highlight')).toBe(true);
        expect(spotlight.style.width).toBe('116px');
        expect(spotlight.style.height).toBe('56px');

        controller.destroy();
        resolve();
      });
    });
  });
});
