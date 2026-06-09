import { BattleVictoryOverlayRenderer } from '../components/BattleVictoryOverlayRenderer';
import { BattleVictoryPayload } from '../components/BattleVictoryDetector';

const AUTO_CONTINUE_MS = 4000;

export class BattleVictoryFlow {
  private active = false;
  private autoContinueTimer: number | null = null;
  private countdownTimer: number | null = null;
  private pendingChestHandler: (() => void) | null = null;

  constructor(
    private readonly overlayEl: HTMLElement,
    private readonly battleStripEl: HTMLElement,
    private readonly renderer: BattleVictoryOverlayRenderer,
    private readonly onContinue: () => void,
  ) {}

  isActive(): boolean {
    return this.active;
  }

  show(payload: BattleVictoryPayload, onChestAvailable?: () => void): void {
    if (this.active) return;

    this.active = true;
    this.pendingChestHandler = onChestAvailable ?? null;
    this.battleStripEl.classList.add('battle-strip--victory');
    this.renderer.render(this.overlayEl, payload);
    this.overlayEl.classList.remove('hidden');
    this.bindContinue();
    this.startAutoContinue();
  }

  dismiss(): void {
    if (!this.active) return;

    this.clearTimers();
    this.active = false;
    this.overlayEl.classList.add('hidden');
    this.overlayEl.innerHTML = '';
    this.battleStripEl.classList.remove('battle-strip--victory');

    const chestHandler = this.pendingChestHandler;
    this.pendingChestHandler = null;

    if (chestHandler) {
      chestHandler();
    }

    this.onContinue();
  }

  private bindContinue(): void {
    const button = this.overlayEl.querySelector('[data-victory-continue]');
    button?.addEventListener('click', () => this.dismiss(), { once: true });
  }

  private startAutoContinue(): void {
    const countdownEl = this.overlayEl.querySelector('[data-victory-countdown]');
    const startedAt = Date.now();

    const updateCountdown = () => {
      if (!this.active || !countdownEl) return;
      const remainingMs = AUTO_CONTINUE_MS - (Date.now() - startedAt);
      if (remainingMs <= 0) {
        countdownEl.textContent = 'Avançando…';
        return;
      }
      const seconds = Math.ceil(remainingMs / 1000);
      countdownEl.textContent = `Avançando em ${seconds}s…`;
    };

    updateCountdown();
    this.countdownTimer = window.setInterval(updateCountdown, 200);
    this.autoContinueTimer = window.setTimeout(() => this.dismiss(), AUTO_CONTINUE_MS);
  }

  private clearTimers(): void {
    if (this.autoContinueTimer !== null) {
      window.clearTimeout(this.autoContinueTimer);
      this.autoContinueTimer = null;
    }
    if (this.countdownTimer !== null) {
      window.clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
