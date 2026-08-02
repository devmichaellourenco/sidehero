// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';
import { ModalController } from './ModalController';

describe('ModalController title + pin shell', () => {
  function mountModal(): {
    controller: ModalController;
    titleMain: HTMLElement;
    pin: HTMLButtonElement;
  } {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="modal-root hidden">
        <button data-modal-close type="button">x</button>
        <div id="modal-title" class="modal-title">
          <div class="sheet-title-row">
            <div id="modal-title-main" class="modal-title-main"></div>
            <button type="button" id="modal-surface-pin" class="stats-pin-btn hidden" data-surface-pin hidden>
              <img class="stats-pin-btn__icon" alt="" />
            </button>
          </div>
        </div>
        <div id="modal-body"></div>
      </div>
    `;
    document.body.appendChild(root);
    const titleMain = root.querySelector('#modal-title-main') as HTMLElement;
    const pin = root.querySelector('#modal-surface-pin') as HTMLButtonElement;
    const controller = new ModalController(
      root.querySelector('.modal-root') as HTMLElement,
      titleMain,
      root.querySelector('#modal-body') as HTMLElement,
    );
    return { controller, titleMain, pin };
  }

  it('escreve título em modal-title-main sem apagar o botão de pin', () => {
    const { controller, titleMain, pin } = mountModal();
    controller.open('Loja');
    expect(titleMain.textContent).toBe('Loja');
    expect(pin.isConnected).toBe(true);
    expect(document.querySelector('#modal-surface-pin')).toBe(pin);

    controller.setTitleHtml('<span class="campaign-view-toggle">Campanha</span>');
    expect(titleMain.querySelector('.campaign-view-toggle')).toBeTruthy();
    expect(document.querySelector('#modal-surface-pin')).toBe(pin);
  });
});
