import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_ROOT_ID,
  SidebarPreferences,
  SidebarPreferencesStore,
} from '../../infrastructure/storage/SidebarPreferences';
import { PageLayoutAdjuster } from './PageLayoutAdjuster';

export type ContentMessage =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_COLLAPSE' }
  | { type: 'SHOW_SIDEBAR' }
  | { type: 'HIDE_SIDEBAR' };

export class SidebarHost {
  private prefs: SidebarPreferences;
  private root: HTMLElement | null = null;
  private readonly pageLayout = new PageLayoutAdjuster();

  constructor(private readonly prefsStore: SidebarPreferencesStore) {
    this.prefs = { visible: true, collapsed: false, width: 380 };
  }

  async init(): Promise<void> {
    this.prefs = await this.prefsStore.load();
    if (this.prefs.visible) {
      this.mount();
    }
  }

  async show(): Promise<void> {
    this.prefs = await this.prefsStore.update({ visible: true });
    this.mount();
  }

  async hide(): Promise<void> {
    this.prefs = await this.prefsStore.update({ visible: false });
    this.unmount();
  }

  async toggleVisibility(): Promise<void> {
    if (this.isMounted()) {
      await this.hide();
      return;
    }
    await this.show();
  }

  private isMounted(): boolean {
    return Boolean(this.root ?? document.getElementById(SIDEBAR_ROOT_ID));
  }

  async toggleCollapse(): Promise<void> {
    if (!this.root) return;
    this.prefs = await this.prefsStore.update({ collapsed: !this.prefs.collapsed });
    this.applyLayout();
  }

  private mount(): void {
    const existing = document.getElementById(SIDEBAR_ROOT_ID) as HTMLElement | null;

    if (existing) {
      this.root = existing;
      this.bindRootEvents(existing);
      this.applyLayout();
      return;
    }

    if (this.root) return;

    this.injectStyles();
    this.root = this.createRoot();
    document.documentElement.appendChild(this.root);
    this.applyLayout();
  }

  private unmount(): void {
    this.root?.remove();
    this.root = null;
    this.resetPageLayout();
  }

  private createRoot(): HTMLElement {
    const root = document.createElement('div');
    root.id = SIDEBAR_ROOT_ID;

    const panelUrl = chrome.runtime.getURL('panel/panel.html');

    root.innerHTML = `
      <div class="th-toolbar">
        <button class="th-toolbar-btn th-collapse-btn" title="Recolher painel">◀</button>
        <span class="th-toolbar-title">⚔️ Side Hero</span>
        <button class="th-toolbar-btn th-close-btn" title="Ocultar painel">✕</button>
      </div>
      <iframe class="th-game-frame" src="${panelUrl}" title="Side Hero"></iframe>
      <div class="th-expand-label">SIDE HERO</div>
    `;

    this.bindRootEvents(root);
    return root;
  }

  private bindRootEvents(root: HTMLElement): void {
    if (root.dataset.thBound === 'true') return;
    root.dataset.thBound = 'true';

    root.querySelector('.th-collapse-btn')?.addEventListener('click', () => {
      void this.toggleCollapse();
    });

    root.querySelector('.th-close-btn')?.addEventListener('click', () => {
      void this.toggleVisibility();
    });

    root.querySelector('.th-expand-label')?.addEventListener('click', () => {
      void this.toggleCollapse();
    });
  }

  private applyLayout(): void {
    if (!this.root) return;

    const width = this.prefs.collapsed ? SIDEBAR_COLLAPSED_WIDTH : this.prefs.width;

    if (this.prefs.collapsed) {
      this.root.classList.add('th-collapsed');
    } else {
      this.root.classList.remove('th-collapsed');
    }

    this.pageLayout.apply(width);
  }

  private resetPageLayout(): void {
    this.pageLayout.reset();
  }

  private injectStyles(): void {
    if (document.getElementById('taskbar-hero-sidebar-styles')) return;

    const link = document.createElement('link');
    link.id = 'taskbar-hero-sidebar-styles';
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('content/sidebar-host.css');
    document.head.appendChild(link);
  }
}
