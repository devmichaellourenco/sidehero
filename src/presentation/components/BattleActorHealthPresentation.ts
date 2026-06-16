export function clampHealthPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}

export function renderStripHealthBar(options: {
  side: 'hero' | 'enemy';
  healthLabel: string;
  healthPercent: number;
}): string {
  return `
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
  `;
}
