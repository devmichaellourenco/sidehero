import { BattleVictoryOverlayRenderer } from '../components/BattleVictoryOverlayRenderer';
import { BattleVictoryPayload } from '../components/BattleVictoryDetector';

export const AUTO_DISMISS_MS = 3000;

/** Overlay informativo de vitória — não bloqueia ticks nem auto-batalha. */
export class BattleVictoryFlow {
  private overlayVisible = false;
  private autoDismissTimer: number | null = null;
  private countdownTimer: number | null = null;
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
    this.battleStripEl.classList.add('battle-strip--victory');
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
    const continueBtn = this.overlayEl.querySelector('[data-victory-continue]');
    continueBtn?.addEventListener('click', () => this.dismiss(), { once: true });
  }

  private startAutoDismiss(): void {
    const countdownEl = this.overlayEl.querySelector('[data-victory-countdown]');
    const startedAt = Date.now();

    const updateCountdown = () => {
      if (!this.overlayVisible || !countdownEl) return;
      const remainingMs = AUTO_DISMISS_MS - (Date.now() - startedAt);
      if (remainingMs <= 0) {
        countdownEl.textContent = 'Fechando…';
        return;
      }
      const seconds = Math.ceil(remainingMs / 1000);
      countdownEl.textContent = `Fechando em ${seconds}s · batalha continua no fundo`;
    };

    updateCountdown();
    this.countdownTimer = globalThis.setInterval(updateCountdown, 200);
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
    if (this.countdownTimer !== null) {
      globalThis.clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
