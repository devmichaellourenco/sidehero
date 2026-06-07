import {
  SIDEBAR_COLLAPSED_CLASS,
  SIDEBAR_LAYOUT_CLASS,
  SIDEBAR_WIDTH_VAR,
} from '../../infrastructure/storage/SidebarPreferences';
import { FixedLayoutPatcher } from './layout/FixedLayoutPatcher';
import { buildLayoutCss, isYouTubeHost, shouldUseFixedPatcher } from './layout/SiteLayoutRules';
import { YouTubeLayoutPatcher } from './layout/YouTubeLayoutPatcher';

const PAGE_LAYOUT_STYLE_ID = 'taskbar-hero-page-layout-styles';

export class PageLayoutAdjuster {
  private observer: MutationObserver | null = null;
  private currentWidth = 0;
  private readonly fixedPatcher = new FixedLayoutPatcher();
  private readonly youtubePatcher = new YouTubeLayoutPatcher();

  apply(widthPx: number): void {
    this.currentWidth = widthPx;
    const html = document.documentElement;

    html.style.setProperty(SIDEBAR_WIDTH_VAR, `${widthPx}px`);
    html.classList.add(SIDEBAR_LAYOUT_CLASS);
    html.classList.toggle(SIDEBAR_COLLAPSED_CLASS, widthPx <= 44);

    this.applyBodyLayout();
    this.injectLayoutStyles(widthPx);

    if (shouldUseFixedPatcher()) {
      this.fixedPatcher.reset();
      this.fixedPatcher.patch(widthPx);
    } else if (isYouTubeHost()) {
      this.youtubePatcher.reset();
      this.youtubePatcher.patch(widthPx);
    }

    this.startObserver();
  }

  reset(): void {
    this.stopObserver();
    this.fixedPatcher.reset();
    this.youtubePatcher.reset();
    this.currentWidth = 0;

    const html = document.documentElement;
    html.classList.remove(SIDEBAR_LAYOUT_CLASS, SIDEBAR_COLLAPSED_CLASS);
    html.style.removeProperty(SIDEBAR_WIDTH_VAR);

    if (document.body) {
      document.body.style.removeProperty('width');
      document.body.style.removeProperty('max-width');
      document.body.style.removeProperty('overflow-x');
      document.body.style.removeProperty('box-sizing');
      document.body.style.removeProperty('margin-right');
      document.body.style.removeProperty('padding-right');
    }

    document.getElementById(PAGE_LAYOUT_STYLE_ID)?.remove();
  }

  private applyBodyLayout(): void {
    if (!document.body) return;

    const body = document.body;
    body.style.setProperty('width', '100%', 'important');
    body.style.setProperty('max-width', '100%', 'important');
    body.style.setProperty('overflow-x', 'hidden', 'important');
    body.style.setProperty('box-sizing', 'border-box', 'important');
    body.style.setProperty('margin-right', '0', 'important');
    body.style.setProperty('padding-right', '0', 'important');
  }

  private injectLayoutStyles(widthPx: number): void {
    let style = document.getElementById(PAGE_LAYOUT_STYLE_ID) as HTMLStyleElement | null;

    if (!style) {
      style = document.createElement('style');
      style.id = PAGE_LAYOUT_STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = buildLayoutCss(widthPx);
  }

  private startObserver(): void {
    if (this.observer || !document.body) return;

    this.observer = new MutationObserver(() => {
      if (!document.documentElement.classList.contains(SIDEBAR_LAYOUT_CLASS)) return;
      if (!this.currentWidth) return;

      this.applyBodyLayout();

      if (shouldUseFixedPatcher()) {
        this.fixedPatcher.schedulePatch(this.currentWidth);
      } else if (isYouTubeHost()) {
        this.youtubePatcher.schedulePatch(this.currentWidth);
      }
    });

    this.observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class'],
    });
  }

  private stopObserver(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
