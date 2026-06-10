import { BattleVictoryOverlayRenderer } from '../components/BattleVictoryOverlayRenderer';
import { BattleVictoryPayload } from '../components/BattleVictoryDetector';

export const AUTO_CONTINUE_MS = 3000;

export interface BattleVictoryFlowCallbacks {
  onIntermissionStart?: () => void;
  onIntermissionEnd?: () => void;
}

export class BattleVictoryFlow {
  private overlayVisible = false;
  private intermissionPause = false;
  private autoContinueTimer: number | null = null;
  private countdownTimer: number | null = null;
  private pendingChestHandler: (() => void) | null = null;
  private callbacks: BattleVictoryFlowCallbacks = {};

  constructor(
    private readonly overlayEl: HTMLElement,
    private readonly battleStripEl: HTMLElement,
    private readonly renderer: BattleVictoryOverlayRenderer,
    private readonly onContinue: () => void,
  ) {}

  /** Overlay de vitória visível (countdown ativo). */
  isActive(): boolean {
    return this.overlayVisible;
  }

  /** Pausa manual entre fases para ajustes de party/loadout. */
  isIntermissionPause(): boolean {
    return this.intermissionPause;
  }

  /** Bloqueia ticks, auto-batalha e avanço até continuar. */
  isBlockingAdvance(): boolean {
    return this.overlayVisible || this.intermissionPause;
  }

  show(
    payload: BattleVictoryPayload,
    onChestAvailable?: () => void,
    callbacks: BattleVictoryFlowCallbacks = {},
  ): void {
    if (this.isBlockingAdvance()) return;

    this.callbacks = callbacks;
    this.overlayVisible = true;
    this.intermissionPause = false;
    this.pendingChestHandler = onChestAvailable ?? null;
    this.battleStripEl.classList.add('battle-strip--victory');
    this.renderer.render(this.overlayEl, payload);
    this.overlayEl.classList.remove('hidden');
    this.bindActions();
    this.startAutoContinue();
  }

  pauseForAdjustments(): void {
    if (!this.overlayVisible) return;

    this.clearTimers();
    this.hideOverlay();
    this.overlayVisible = false;
    this.intermissionPause = true;
    this.callbacks.onIntermissionStart?.();
  }

  dismiss(): void {
    if (!this.isBlockingAdvance()) return;

    const wasIntermission = this.intermissionPause;
    const callbacks = this.callbacks;

    this.clearTimers();
    this.overlayVisible = false;
    this.intermissionPause = false;
    this.hideOverlay();

    const chestHandler = this.pendingChestHandler;
    this.pendingChestHandler = null;
    this.callbacks = {};

    if (wasIntermission) {
      callbacks.onIntermissionEnd?.();
    }

    if (chestHandler) {
      chestHandler();
    }

    this.onContinue();
  }

  private bindActions(): void {
    const continueBtn = this.overlayEl.querySelector('[data-victory-continue]');
    continueBtn?.addEventListener('click', () => this.dismiss(), { once: true });

    const adjustBtn = this.overlayEl.querySelector('[data-victory-adjust]');
    adjustBtn?.addEventListener('click', () => this.pauseForAdjustments(), { once: true });
  }

  private startAutoContinue(): void {
    const countdownEl = this.overlayEl.querySelector('[data-victory-countdown]');
    const startedAt = Date.now();

    const updateCountdown = () => {
      if (!this.overlayVisible || !countdownEl) return;
      const remainingMs = AUTO_CONTINUE_MS - (Date.now() - startedAt);
      if (remainingMs <= 0) {
        countdownEl.textContent = 'Avançando…';
        return;
      }
      const seconds = Math.ceil(remainingMs / 1000);
      countdownEl.textContent = `Avançando em ${seconds}s…`;
    };

    updateCountdown();
    this.countdownTimer = globalThis.setInterval(updateCountdown, 200);
    this.autoContinueTimer = globalThis.setTimeout(() => this.dismiss(), AUTO_CONTINUE_MS);
  }

  private hideOverlay(): void {
    this.overlayEl.classList.add('hidden');
    this.overlayEl.innerHTML = '';
    this.battleStripEl.classList.remove('battle-strip--victory');
  }

  private clearTimers(): void {
    if (this.autoContinueTimer !== null) {
      globalThis.clearTimeout(this.autoContinueTimer);
      this.autoContinueTimer = null;
    }
    if (this.countdownTimer !== null) {
      globalThis.clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
