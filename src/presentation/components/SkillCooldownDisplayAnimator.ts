import { formatSkillCooldownCountdown } from '../../domain/combat/SkillCooldownTiming';

const UPDATE_INTERVAL_MS = 100;

function updateOverlayElement(overlay: HTMLElement, remaining: number, total: number): void {
  const shade = overlay.querySelector<HTMLElement>('.hero-skill-cooldown-shade, .combat-skill-cooldown-shade');
  const label = overlay.querySelector<HTMLElement>('.hero-skill-cooldown-label, .combat-skill-cooldown-label');
  if (!shade || !label) return;

  const ready = remaining <= 0 || total <= 0;
  const ratio = ready ? 0 : Math.min(1, remaining / total);

  if (ready) {
    overlay.classList.add('hero-skill-cooldown--ready', 'combat-skill-cooldown--ready');
    shade.style.setProperty('--cooldown-ratio', '0');
    label.textContent = '';
    overlay.removeAttribute('data-remaining-label');
    return;
  }

  overlay.classList.remove('hero-skill-cooldown--ready', 'combat-skill-cooldown--ready');
  shade.style.setProperty('--cooldown-ratio', String(ratio));
  const countdown = formatSkillCooldownCountdown(remaining);
  label.textContent = countdown;
  overlay.setAttribute('data-remaining-label', countdown);
}

/** Interpola cooldowns de skills entre ticks de simulação. */
export class SkillCooldownDisplayAnimator {
  private intervalId: number | null = null;
  private combatActive = false;

  setCombatActive(active: boolean): void {
    this.combatActive = active;
    if (active) {
      this.start();
    } else {
      this.stop();
    }
  }

  /** Registra snapshot de cooldown para interpolação visual. */
  stampOverlay(overlay: HTMLElement, secondsRemaining: number, cooldownTotal: number): void {
    overlay.dataset.cdRemaining = String(Math.max(0, secondsRemaining));
    overlay.dataset.cdTotal = String(Math.max(0, cooldownTotal));
    overlay.dataset.cdCapturedAt = String(performance.now());
  }

  private start(): void {
    if (this.intervalId !== null) return;
    this.intervalId = window.setInterval(() => this.tick(), UPDATE_INTERVAL_MS);
  }

  private stop(): void {
    if (this.intervalId === null) return;
    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private tick(): void {
    if (!this.combatActive) return;

    const now = performance.now();
    document.querySelectorAll<HTMLElement>('[data-cd-remaining]').forEach((overlay) => {
      const baseRemaining = Number.parseFloat(overlay.dataset.cdRemaining ?? '0');
      const total = Number.parseFloat(overlay.dataset.cdTotal ?? '0');
      const capturedAt = Number.parseFloat(overlay.dataset.cdCapturedAt ?? String(now));
      const elapsed = (now - capturedAt) / 1000;
      const remaining = Math.max(0, baseRemaining - elapsed);
      updateOverlayElement(overlay, remaining, total);
    });
  }
}

export function stampSkillCooldownOverlay(
  overlay: HTMLElement,
  secondsRemaining: number,
  cooldownTotal: number,
): void {
  overlay.dataset.cdRemaining = String(Math.max(0, secondsRemaining));
  overlay.dataset.cdTotal = String(Math.max(0, cooldownTotal));
  overlay.dataset.cdCapturedAt = String(performance.now());
}
