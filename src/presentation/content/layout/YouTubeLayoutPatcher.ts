import { isYouTubeHost } from './SiteLayoutRules';

const PATCHED_ATTR = 'data-side-hero-yt-patched';

const ROOT_SELECTORS = ['ytd-app', 'ytd-page-manager', '#page-manager'] as const;

const FIXED_SELECTORS = ['ytd-masthead', 'ytd-app-banner'] as const;

export class YouTubeLayoutPatcher {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  schedulePatch(sidebarWidth: number): void {
    if (!isYouTubeHost()) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.patch(sidebarWidth);
    }, 120);
  }

  patch(sidebarWidth: number): void {
    if (!isYouTubeHost()) return;

    const contentWidth = `calc(100vw - ${sidebarWidth}px)`;

    for (const selector of ROOT_SELECTORS) {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) continue;

      el.style.setProperty('width', selector === 'ytd-app' ? contentWidth : '100%', 'important');
      el.style.setProperty('max-width', selector === 'ytd-app' ? contentWidth : '100%', 'important');
      el.setAttribute(PATCHED_ATTR, '1');
    }

    for (const selector of FIXED_SELECTORS) {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) continue;

      el.style.setProperty('width', contentWidth, 'important');
      el.style.setProperty('max-width', contentWidth, 'important');
      el.style.setProperty('left', '0', 'important');
      el.style.setProperty('right', 'auto', 'important');
      el.setAttribute(PATCHED_ATTR, '1');
    }

    const miniplayer = document.querySelector<HTMLElement>('ytd-miniplayer');
    if (miniplayer) {
      miniplayer.style.setProperty('left', '0', 'important');
      miniplayer.style.setProperty('right', `${sidebarWidth}px`, 'important');
      miniplayer.style.setProperty('width', 'auto', 'important');
      miniplayer.setAttribute(PATCHED_ATTR, '1');
    }
  }

  reset(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    for (const el of document.querySelectorAll<HTMLElement>(`[${PATCHED_ATTR}]`)) {
      el.removeAttribute(PATCHED_ATTR);
      el.style.removeProperty('width');
      el.style.removeProperty('max-width');
      el.style.removeProperty('left');
      el.style.removeProperty('right');
    }
  }
}
