const COLLAPSED_KEY = 'sidehero_battle_log_collapsed';

export class BattleLogPanelController {
  private collapsed = false;

  constructor(
    private readonly panel: HTMLElement,
    private readonly _list: HTMLElement,
    toggleBtn: HTMLButtonElement,
  ) {
    this.collapsed = this.readCollapsedPreference();
    toggleBtn.addEventListener('click', () => {
      this.collapsed = !this.collapsed;
      this.writeCollapsedPreference(this.collapsed);
      this.applyCollapsedState();
    });
    this.applyCollapsedState();
  }

  private readCollapsedPreference(): boolean {
    try {
      return sessionStorage.getItem(COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  }

  private writeCollapsedPreference(collapsed: boolean): void {
    try {
      sessionStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {
      // sessionStorage indisponível
    }
  }

  private applyCollapsedState(): void {
    this.panel.classList.toggle('log-panel--collapsed', this.collapsed);
    const toggle = this.panel.querySelector('.panel-collapse-btn') as HTMLButtonElement | null;
    toggle?.setAttribute('aria-expanded', this.collapsed ? 'false' : 'true');
    toggle?.setAttribute('aria-label', this.collapsed ? 'Expandir log' : 'Recolher log');
    if (toggle) {
      toggle.textContent = this.collapsed ? '▶' : '▼';
    }
  }
}
