// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';
import {
  applySurfacePinButton,
  hideSurfacePinButton,
  surfacePinTooltip,
  systemsMenuLabel,
} from './SurfacePinPresentation';

describe('SurfacePinPresentation', () => {
  it('define tooltips Fixar/Desafixar', () => {
    expect(surfacePinTooltip('dock')).toBe('Fixar');
    expect(surfacePinTooltip('undock')).toBe('Desafixar');
    expect(systemsMenuLabel('stats')).toBe('Estatísticas');
  });

  it('aplica e esconde botão de pin no DOM', () => {
    const button = document.createElement('button');
    const icon = document.createElement('img');
    icon.className = 'stats-pin-btn__icon';
    button.appendChild(icon);

    applySurfacePinButton(button, 'dock', 'Loja');
    expect(button.title).toBe('Fixar');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.classList.contains('hidden')).toBe(false);

    applySurfacePinButton(button, 'undock', 'Loja');
    expect(button.title).toBe('Desafixar');
    expect(button.getAttribute('aria-pressed')).toBe('true');

    hideSurfacePinButton(button);
    expect(button.classList.contains('hidden')).toBe(true);
    expect(button.hidden).toBe(true);
  });
});
