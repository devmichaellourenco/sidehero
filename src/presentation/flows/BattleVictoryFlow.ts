import { BattleVictoryOverlayRenderer } from '../components/BattleVictoryOverlayRenderer';
import { BattleVictoryPayload } from '../components/BattleVictoryDetector';

/** Duração da animação do rótulo CLEAR/WARNING/DEFEAT. */
export const OVERLAY_ANIMATION_MS = 2200;

/** Marcos X-50 — animação mais longa para reforçar conquista. */
export const MILESTONE_OVERLAY_ANIMATION_MS = 3400;

function isTerminalBattleResult(payload: BattleVictoryPayload): boolean {
  return payload.variant === 'phase-clear' || payload.variant === 'defeat';
}

/** Overlay de resultado — bloqueia ticks até dismiss (manual no clear/defeat final). */
export class BattleVictoryFlow {
  private overlayVisible = false;
  private autoDismissTimer: number | null = null;
  private pendingDismissHandler: (() => void) | null = null;
  private detailsRevealed = false;

  constructor(
    private readonly overlayEl: HTMLElement,
    private readonly battleStripEl: HTMLElement,
    private readonly renderer: BattleVictoryOverlayRenderer,
  ) {}

  isActive(): boolean {
    return this.overlayVisible;
  }

  isBlockingAdvance(): boolean {
    return this.overlayVisible;
  }

  isIntermissionPause(): boolean {
    return this.overlayVisible;
  }

  show(payload: BattleVictoryPayload, onDismiss?: () => void): void {
    this.clearTimers();
    this.detailsRevealed = false;
    this.pendingDismissHandler = onDismiss ?? null;
    this.overlayVisible = true;
    this.renderer.render(this.overlayEl, payload);
    this.overlayEl.classList.remove('hidden');
    const milestone = payload.milestoneVictory?.isMilestone === true;
    this.battleStripEl.classList.add(
      milestone ? 'battle-strip--milestone-victory' : 'battle-strip--victory',
    );
    this.battleFieldEl()?.classList.add(
      milestone ? 'battle-field--milestone-victory' : 'battle-field--victory',
    );
    this.bindActions();
    if (isTerminalBattleResult(payload)) {
      this.scheduleRevealDetailsAfterAnimation(payload);
    } else {
      this.scheduleDismissAfterAnimation(payload);
    }
  }

  dismiss(): void {
    if (!this.overlayVisible) return;

    this.clearTimers();
    this.overlayVisible = false;
    this.detailsRevealed = false;
    this.hideOverlay();

    const handler = this.pendingDismissHandler;
    this.pendingDismissHandler = null;
    if (handler) {
      handler();
    }
  }

  private bindActions(): void {
    const detailsToggle = this.overlayEl.querySelector('[data-victory-details-toggle]');
    const detailsPanel = this.overlayEl.querySelector('[data-victory-details-panel]');
    const continueBtn = this.overlayEl.querySelector('[data-victory-continue]');

    detailsToggle?.addEventListener('click', () => {
      if (!detailsPanel || !(detailsToggle instanceof HTMLButtonElement)) return;
      const expanded = detailsPanel.classList.toggle('hidden') === false;
      detailsToggle.textContent = expanded ? 'Ocultar' : 'Detalhes';
      detailsToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    continueBtn?.addEventListener('click', () => this.dismiss());
  }

  private scheduleRevealDetailsAfterAnimation(payload: BattleVictoryPayload): void {
    const isMilestone = payload.milestoneVictory?.isMilestone === true;
    const animationMs = isMilestone ? MILESTONE_OVERLAY_ANIMATION_MS : OVERLAY_ANIMATION_MS;
    const label = this.overlayEl.querySelector('.battle-victory-compact-label');
    if (label) {
      label.addEventListener(
        'animationend',
        () => this.revealDetailsAndAwaitContinue(),
        { once: true },
      );
    }

    this.autoDismissTimer = globalThis.setTimeout(
      () => this.revealDetailsAndAwaitContinue(),
      animationMs + 300,
    );
  }

  private revealDetailsAndAwaitContinue(): void {
    if (!this.overlayVisible || this.detailsRevealed) return;
    this.detailsRevealed = true;
    this.clearTimers();

    const detailsPanel = this.overlayEl.querySelector('[data-victory-details-panel]');
    const detailsToggle = this.overlayEl.querySelector('[data-victory-details-toggle]');
    const continueBtn = this.overlayEl.querySelector('[data-victory-continue]');

    detailsPanel?.classList.remove('hidden');
    continueBtn?.classList.remove('hidden');

    if (detailsToggle instanceof HTMLButtonElement) {
      detailsToggle.textContent = 'Ocultar';
      detailsToggle.setAttribute('aria-expanded', 'true');
    }

    this.overlayEl.classList.add('battle-victory-overlay--await-continue');
  }

  private scheduleDismissAfterAnimation(payload: BattleVictoryPayload): void {
    const isMilestone = payload.milestoneVictory?.isMilestone === true;
    const animationMs = isMilestone ? MILESTONE_OVERLAY_ANIMATION_MS : OVERLAY_ANIMATION_MS;
    const label = this.overlayEl.querySelector('.battle-victory-compact-label');
    if (label) {
      label.addEventListener('animationend', () => this.dismiss(), { once: true });
    }

    this.autoDismissTimer = globalThis.setTimeout(
      () => this.dismiss(),
      animationMs + 300,
    );
  }

  private hideOverlay(): void {
    this.overlayEl.classList.add('hidden');
    this.overlayEl.classList.remove('battle-victory-overlay--await-continue');
    this.overlayEl.innerHTML = '';
    this.battleStripEl.classList.remove('battle-strip--victory', 'battle-strip--milestone-victory');
    this.battleFieldEl()?.classList.remove(
      'battle-field--victory',
      'battle-field--milestone-victory',
    );
  }

  private battleFieldEl(): HTMLElement | null {
    const el = this.battleStripEl as HTMLElement & { closest?: (s: string) => Element | null };
    if (typeof el.closest !== 'function') return null;
    return el.closest('.battle-field');
  }

  private clearTimers(): void {
    if (this.autoDismissTimer !== null) {
      globalThis.clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }
}
