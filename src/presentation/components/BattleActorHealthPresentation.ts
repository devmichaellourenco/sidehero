function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function clampHealthPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}

/** Vida atual visível na strip (sem máximo — evita poluição). */
export function formatStripHealthCurrent(health: number): string {
  return String(Math.max(0, Math.round(health)));
}

export function renderStripActorBars(options: {
  side: 'hero' | 'enemy';
  healthLabel: string;
  healthCurrent: string;
  healthPercent: number;
  actionTimeRatio: number;
}): string {
  const fillWidth = Math.max(0, Math.min(100, options.actionTimeRatio * 100));
  const safeLabel = escapeHtml(options.healthLabel);
  const safeCurrent = escapeHtml(options.healthCurrent);

  return `
    <div class="strip-actor-bars">
      <div
        class="stat-bar health-bar ${options.side} strip-bar"
        data-bar-label="${safeLabel}"
        tabindex="0"
        aria-label="Vida ${safeLabel}"
      >
        <div class="stat-bar-track">
          <div class="health-fill ${options.side}" style="width: ${options.healthPercent}%"></div>
        </div>
        <span class="strip-health-label">${safeCurrent}</span>
      </div>
      <div class="action-time-bar strip-bar" data-action-time-bar aria-hidden="true">
        <div class="action-time-fill" style="width: ${fillWidth}%"></div>
      </div>
    </div>
  `;
}

/** @deprecated Use renderStripActorBars */
export function renderStripHealthBar(options: {
  side: 'hero' | 'enemy';
  healthLabel: string;
  healthPercent: number;
  healthCurrent?: string;
}): string {
  return renderStripActorBars({
    ...options,
    healthCurrent:
      options.healthCurrent ??
      formatStripHealthCurrent(Number.parseFloat(options.healthLabel) || 0),
    actionTimeRatio: 1,
  });
}

export function stampActionTimeBar(
  bar: HTMLElement,
  remaining: number,
  total: number,
): void {
  bar.dataset.atRemaining = String(Math.max(0, remaining));
  bar.dataset.atTotal = String(Math.max(0, total));
  bar.dataset.atCapturedAt = String(performance.now());
}

export function clearActionTimeAnimationStamp(bar: HTMLElement): void {
  delete bar.dataset.atRemaining;
  delete bar.dataset.atTotal;
  delete bar.dataset.atCapturedAt;
}

/** Mantém a largura atual da barra e só remove stamps de interpolação client-side. */
export function freezeActionTimeVisualOnCard(card: HTMLElement): void {
  const bar = card.querySelector<HTMLElement>('[data-action-time-bar]');
  if (!bar) return;
  clearActionTimeAnimationStamp(bar);
}

export function patchActionTimeBar(
  card: HTMLElement,
  actionTimeRatio: number,
  actionTimeRemaining: number,
  actionTimeTotal: number,
  freeze = false,
  applyWidth = !freeze,
): void {
  const fill = card.querySelector<HTMLElement>('.action-time-fill');
  const bar = card.querySelector<HTMLElement>('[data-action-time-bar]');
  if (!fill || !bar) return;

  if (freeze) {
    clearActionTimeAnimationStamp(bar);
  }

  if (!applyWidth) return;

  const width = Math.max(0, Math.min(100, actionTimeRatio * 100));
  fill.style.width = `${width}%`;
  if (!freeze) {
    stampActionTimeBar(bar, actionTimeRemaining, actionTimeTotal);
  }
}
