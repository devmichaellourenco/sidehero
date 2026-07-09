import { BattleVictoryOverlayRenderer } from '../components/BattleVictoryOverlayRenderer';
import { BattleVictoryPayload } from '../components/BattleVictoryDetector';

/** Duração da animação do rótulo CLEAR/WARNING/DEFEAT. */
export const OVERLAY_ANIMATION_MS = 2200;

/** Marcos X-50 — animação mais longa para reforçar conquista. */
export const MILESTONE_OVERLAY_ANIMATION_MS = 3400;

/** Overlay de resultado — bloqueia ticks até a animação terminar. */
export class BattleVictoryFlow {
  private overlayVisible = false;
  private autoDismissTimer: number | null = null;
  private pendingDismissHandler: (() => void) | null = null;

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
    this.pendingDismissHandler = onDismiss ?? null;
    this.overlayVisible = true;
    this.renderer.render(this.overlayEl, payload);
    this.overlayEl.classList.remove('hidden');
    this.battleStripEl.classList.add(
      payload.milestoneVictory?.isMilestone ? 'battle-strip--milestone-victory' : 'battle-strip--victory',
    );
    this.bindActions();
    this.scheduleDismissAfterAnimation(payload);
  }

  dismiss(): void {
    if (!this.overlayVisible) return;

    this.clearTimers();
    this.overlayVisible = false;
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

    detailsToggle?.addEventListener('click', () => {
      if (!detailsPanel || !(detailsToggle instanceof HTMLButtonElement)) return;
      const expanded = detailsPanel.classList.toggle('hidden') === false;
      detailsToggle.textContent = expanded ? 'Ocultar' : 'Detalhes';
      detailsToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
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
    this.overlayEl.innerHTML = '';
    this.battleStripEl.classList.remove('battle-strip--victory', 'battle-strip--milestone-victory');
  }

  private clearTimers(): void {
    if (this.autoDismissTimer !== null) {
      globalThis.clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }
}
