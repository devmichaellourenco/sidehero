import { CombatFloatingEventDto } from '../../application/dto/CombatFloatingEventDto';

const FLOAT_DURATION_MS = 900;

export class BattleFloatingTextController {
  constructor(
    private readonly layer: HTMLElement,
    private readonly battleStrip: HTMLElement,
  ) {}

  show(events: CombatFloatingEventDto[]): void {
    if (!events.length) return;

    const targetOffsets = new Map<string, number>();

    for (const event of events) {
      const anchor = this.findAnchor(event);
      if (!anchor) continue;

      const offsetKey = `${event.target}:${event.targetId}:${event.kind}`;
      const offsetIndex = targetOffsets.get(offsetKey) ?? 0;
      targetOffsets.set(offsetKey, offsetIndex + 1);

      this.spawn(event, anchor, offsetIndex);
    }
  }

  private findAnchor(event: CombatFloatingEventDto): HTMLElement | null {
    if (event.target === 'hero') {
      return this.battleStrip.querySelector(
        `[data-hero-id="${event.targetId}"] [data-float-anchor="hero"]`,
      );
    }

    return this.battleStrip.querySelector(
      `[data-enemy-id="${event.targetId}"] [data-float-anchor="enemy"]`,
    );
  }

  private spawn(event: CombatFloatingEventDto, anchor: HTMLElement, offsetIndex: number): void {
    const anchorRect = anchor.getBoundingClientRect();
    const stripRect = this.battleStrip.getBoundingClientRect();
    const label = event.kind === 'damage' ? `-${event.amount}` : `+${event.amount}`;

    const float = document.createElement('span');
    float.className = `battle-float battle-float--${event.kind}`;
    float.textContent = label;
    float.setAttribute('role', 'presentation');
    float.setAttribute('aria-hidden', 'true');
    float.style.left = `${anchorRect.left - stripRect.left + anchorRect.width / 2 + offsetIndex * 8}px`;
    float.style.top = `${anchorRect.top - stripRect.top}px`;
    float.style.animationDelay = `${offsetIndex * 0.06}s`;

    this.layer.appendChild(float);
    window.setTimeout(() => float.remove(), FLOAT_DURATION_MS + offsetIndex * 60);
  }
}
