import { SIDEBAR_ROOT_ID } from '../../../infrastructure/storage/SidebarPreferences';

const PATCHED_ATTR = 'data-side-hero-patched';

export class FixedLayoutPatcher {
  private patchedElements = new Set<HTMLElement>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  schedulePatch(sidebarWidth: number): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.patch(sidebarWidth);
    }, 120);
  }

  patch(sidebarWidth: number): void {
    const maxWidth = `calc(100vw - ${sidebarWidth}px)`;
    const viewportThreshold = window.innerWidth - sidebarWidth - 24;

    for (const el of document.querySelectorAll<HTMLElement>('body *')) {
      if (this.shouldSkip(el)) continue;

      const computed = getComputedStyle(el);
      if (computed.position !== 'fixed' && computed.position !== 'sticky') continue;

      const rect = el.getBoundingClientRect();
      const spansViewport = rect.left <= 8 && rect.width >= viewportThreshold;

      if (!spansViewport) continue;

      el.style.setProperty('width', maxWidth, 'important');
      el.style.setProperty('max-width', maxWidth, 'important');
      el.style.setProperty('left', '0', 'important');
      el.setAttribute(PATCHED_ATTR, '1');
      this.patchedElements.add(el);
    }
  }

  reset(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    for (const el of this.patchedElements) {
      el.removeAttribute(PATCHED_ATTR);
      el.style.removeProperty('width');
      el.style.removeProperty('max-width');
      el.style.removeProperty('left');
    }

    this.patchedElements.clear();
  }

  private shouldSkip(el: HTMLElement): boolean {
    if (el.id === SIDEBAR_ROOT_ID) return true;
    if (el.closest(`#${SIDEBAR_ROOT_ID}`)) return true;
    if (el.hasAttribute(PATCHED_ATTR)) return false;
    return false;
  }
}
