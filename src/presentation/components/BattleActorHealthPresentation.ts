export function clampHealthPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}

export function renderStripActorBars(options: {
  side: 'hero' | 'enemy';
  healthLabel: string;
  healthPercent: number;
  actionTimeRatio: number;
}): string {
  const fillWidth = Math.max(0, Math.min(100, options.actionTimeRatio * 100));

  return `
    <div class="strip-actor-bars">
      <div
        class="stat-bar health-bar ${options.side} strip-bar"
        data-bar-label="${options.healthLabel}"
        tabindex="0"
        aria-label="Vida ${options.healthLabel}"
      >
        <div class="stat-bar-track">
          <div class="health-fill ${options.side}" style="width: ${options.healthPercent}%"></div>
        </div>
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
}): string {
  return renderStripActorBars({ ...options, actionTimeRatio: 1 });
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
