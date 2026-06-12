import { BattleVictoryOverlayRenderer } from '../components/BattleVictoryOverlayRenderer';
import { BattleVictoryPayload } from '../components/BattleVictoryDetector';

export const AUTO_DISMISS_MS = 3000;

/** Overlay informativo de vitória — não bloqueia ticks nem auto-batalha. */
export class BattleVictoryFlow {
  private overlayVisible = false;
  private autoDismissTimer: number | null = null;
  private pendingChestHandler: (() => void) | null = null;

  constructor(
    private readonly overlayEl: HTMLElement,
    private readonly battleStripEl: HTMLElement,
    private readonly renderer: BattleVictoryOverlayRenderer,
  ) {}

  isActive(): boolean {
    return this.overlayVisible;
  }

  /** Mantido por compatibilidade — vitória não bloqueia mais o avanço. */
  isBlockingAdvance(): boolean {
    return false;
  }

  isIntermissionPause(): boolean {
    return false;
  }

  show(payload: BattleVictoryPayload, onChestAvailable?: () => void): void {
    this.clearTimers();
    this.pendingChestHandler = onChestAvailable ?? null;
    this.overlayVisible = true;
    this.renderer.render(this.overlayEl, payload);
    this.overlayEl.classList.remove('hidden');
    this.bindActions();
    this.startAutoDismiss();
  }

  dismiss(): void {
    if (!this.overlayVisible) return;

    this.clearTimers();
    this.overlayVisible = false;
    this.hideOverlay();

    const chestHandler = this.pendingChestHandler;
    this.pendingChestHandler = null;
    if (chestHandler) {
      chestHandler();
    }
  }

  private bindActions(): void {
    const detailsToggle = this.overlayEl.querySelector('[data-victory-details-toggle]');
    const detailsPanel = this.overlayEl.querySelector('[data-victory-details-panel]');

    detailsToggle?.addEventListener('click', () => {
      if (!detailsPanel || !(detailsToggle instanceof HTMLButtonElement)) return;
      const expanded = detailsPanel.classList.toggle('hidden') === false;
      detailsToggle.textContent = expanded ? 'Ocultar' : 'Detalhes';
      detailsToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  private startAutoDismiss(): void {
    this.autoDismissTimer = globalThis.setTimeout(() => this.dismiss(), AUTO_DISMISS_MS);
  }

  private hideOverlay(): void {
    this.overlayEl.classList.add('hidden');
    this.overlayEl.innerHTML = '';
    this.battleStripEl.classList.remove('battle-strip--victory');
  }

  private clearTimers(): void {
    if (this.autoDismissTimer !== null) {
      globalThis.clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }
}
