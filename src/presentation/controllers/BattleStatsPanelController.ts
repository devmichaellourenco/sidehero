const VISIBLE_KEY = 'sidehero_battle_stats_visible';

export class BattleStatsPanelController {
  private visible = false;

  constructor(
    private readonly overlay: HTMLElement,
    private readonly toggleBtn: HTMLButtonElement,
    closeBtn: HTMLButtonElement,
    private readonly bodyEl: HTMLElement,
  ) {
    this.visible = this.readVisiblePreference();
    toggleBtn.addEventListener('click', () => this.toggle());
    closeBtn.addEventListener('click', () => this.hide());

    overlay.querySelectorAll('[data-battle-stats-close]').forEach((element) => {
      element.addEventListener('click', () => this.hide());
    });

    this.applyVisibility();
  }

  private readVisiblePreference(): boolean {
    try {
      return sessionStorage.getItem(VISIBLE_KEY) === '1';
    } catch {
      return false;
    }
  }

  private writeVisiblePreference(visible: boolean): void {
    try {
      sessionStorage.setItem(VISIBLE_KEY, visible ? '1' : '0');
    } catch {
      // sessionStorage indisponível
    }
  }

  toggle(): void {
    this.visible = !this.visible;
    this.writeVisiblePreference(this.visible);
    this.applyVisibility();
  }

  show(): void {
    if (this.visible) return;
    this.visible = true;
    this.writeVisiblePreference(true);
    this.applyVisibility();
  }

  hide(): void {
    if (!this.visible) return;
    this.visible = false;
    this.writeVisiblePreference(false);
    this.applyVisibility();
  }

  isVisible(): boolean {
    return this.visible;
  }

  setContent(html: string): void {
    this.bodyEl.innerHTML = html;
  }

  private applyVisibility(): void {
    this.overlay.classList.toggle('hidden', !this.visible);
    this.overlay.setAttribute('aria-hidden', this.visible ? 'false' : 'true');
    this.toggleBtn.classList.toggle('action-icon-btn--active', this.visible);
    this.toggleBtn.setAttribute('aria-expanded', this.visible ? 'true' : 'false');
  }
}
