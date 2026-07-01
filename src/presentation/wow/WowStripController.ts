import { GameStateDto } from '../../application/dto/GameStateDto';
import { RewardMoment } from '../delight/types/RewardMoment';
import { buildPersistentWowBanners, WowPersistentHandlers } from './WowBannerBuilder';
import { mapRewardMomentToWowBanner } from './WowMomentMapper';
import { filterUndismissedBanners, recordWowBannerDismiss } from './WowStripDismissStore';
import { WowStripRenderer } from './WowStripRenderer';
import { buildWowStripSnapshot } from './WowStripRenderPolicy';
import { WowBanner, WowBannerAction } from './types/WowBanner';

const ROTATE_MS = 6200;
const EPHEMERAL_DEFAULT_MS = 4200;

export class WowStripController {
  private readonly renderer = new WowStripRenderer();
  private readonly ephemeral: WowBanner[] = [];
  private persistent: WowBanner[] = [];
  private activeIndex = 0;
  private rotateTimer: number | null = null;
  private ephemeralTimer: number | null = null;
  private ephemeralExpiryTargetId: string | null = null;
  private paused = false;
  private handlers: WowPersistentHandlers | null = null;
  private renderedSnapshot: string | null = null;
  private lastActiveBannerId: string | null = null;

  constructor(private readonly root: HTMLElement) {
    this.root.addEventListener('click', (event) => this.handleClick(event));
    this.root.addEventListener('mouseenter', () => {
      this.paused = true;
    });
    this.root.addEventListener('mouseleave', () => {
      this.paused = false;
    });
  }

  sync(state: GameStateDto, handlers: WowPersistentHandlers): void {
    this.handlers = handlers;
    this.persistent = filterUndismissedBanners(buildPersistentWowBanners(state, handlers));
    this.clampActiveIndex();
    this.renderIfNeeded();
    this.ensureRotation();
  }

  enqueueMoment(moment: RewardMoment): void {
    const banner = mapRewardMomentToWowBanner(moment);
    if (!banner) return;
    if (this.ephemeral.some((entry) => entry.id === banner.id)) return;

    if (moment.cta) {
      banner.cta = {
        label: moment.cta.label,
        action: 'dismiss',
      };
      banner.onCtaClick = moment.cta.onClick;
    }

    this.ephemeral.push(banner);
    this.ephemeral.sort((left, right) => right.priority - left.priority);
    this.focusBanner(banner);
    this.renderIfNeeded(true);
    this.ensureRotation();
  }

  destroy(): void {
    this.stopRotation();
    this.stopEphemeralTimer();
  }

  private get banners(): WowBanner[] {
    const merged = [...this.persistent, ...this.ephemeral];
    merged.sort((left, right) => right.priority - left.priority);
    return merged;
  }

  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;

    const dismissEl = target.closest('[data-wow-dismiss]') as HTMLElement | null;
    if (dismissEl) {
      event.stopPropagation();
      const active = this.banners[this.activeIndex];
      if (active) this.dismissBanner(active);
      return;
    }

    const dot = target.closest('[data-wow-dot]') as HTMLElement | null;
    if (dot) {
      const index = Number(dot.getAttribute('data-wow-dot'));
      if (!Number.isNaN(index)) {
        this.activeIndex = index;
        this.renderIfNeeded(true);
      }
      return;
    }

    const actionEl = target.closest('[data-wow-action]') as HTMLElement | null;
    if (actionEl) {
      event.stopPropagation();
      const action = actionEl.getAttribute('data-wow-action') as WowBannerAction | null;
      if (!action) return;

      const active = this.banners[this.activeIndex];
      if (active?.onCtaClick) {
        active.onCtaClick();
      } else {
        this.dispatchAction(action);
      }

      if (action === 'dismiss' && active) {
        this.dismissBanner(active);
      } else if (active?.persistence === 'ephemeral') {
        this.removeEphemeral(active.id);
      }
      return;
    }

    const bannerEl = target.closest('[data-wow-banner-id]') as HTMLElement | null;
    if (bannerEl && !actionEl) {
      const active = this.banners[this.activeIndex];
      if (active?.cta) {
        if (active.onCtaClick) {
          active.onCtaClick();
        } else {
          this.dispatchAction(active.cta.action);
        }
        if (active.cta.action === 'dismiss') {
          this.dismissBanner(active);
        } else if (active.persistence === 'ephemeral') {
          this.removeEphemeral(active.id);
        }
      }
    }
  }

  private dismissBanner(banner: WowBanner): void {
    recordWowBannerDismiss(banner);

    if (banner.persistence === 'ephemeral') {
      this.removeEphemeral(banner.id);
      return;
    }

    this.persistent = this.persistent.filter((entry) => entry.id !== banner.id);
    this.clampActiveIndex();
    this.renderIfNeeded(true);
  }

  private focusBanner(banner: WowBanner): void {
    const merged = this.banners;
    const index = merged.findIndex((entry) => entry.id === banner.id);
    if (index === -1) return;

    const current = merged[this.activeIndex];
    if (!current || banner.priority >= current.priority) {
      this.activeIndex = index;
    }
  }

  private dispatchAction(action: WowBannerAction): void {
    if (!this.handlers) return;

    switch (action) {
      case 'chest':
        this.handlers.onChestOpen();
        return;
      case 'inventory-upgrade':
        this.handlers.onInventoryOpen();
        return;
      case 'upgrade-tree':
        this.handlers.onUpgradesOpen();
        return;
      case 'hero-points':
        this.handlers.onHeroPointsOpen();
        return;
      case 'new-game':
        this.handlers.onNewGame();
        return;
      case 'dismiss':
        return;
    }
  }

  private removeEphemeral(id: string): void {
    const index = this.ephemeral.findIndex((entry) => entry.id === id);
    if (index === -1) return;
    this.ephemeral.splice(index, 1);
    this.clampActiveIndex();
    this.renderIfNeeded(true);
  }

  private clampActiveIndex(): void {
    const count = this.banners.length;
    if (count === 0) {
      this.activeIndex = 0;
      return;
    }
    if (this.activeIndex >= count) {
      this.activeIndex = 0;
    }
  }

  private renderIfNeeded(force = false): void {
    const banners = this.banners;
    const snapshot = buildWowStripSnapshot(banners, this.activeIndex);

    if (!force && snapshot === this.renderedSnapshot) {
      return;
    }

    const active = banners[this.activeIndex] ?? banners[0];
    const animate = active?.id !== this.lastActiveBannerId;

    this.renderer.render(this.root, banners, this.activeIndex, { animate });
    this.renderedSnapshot = snapshot;
    this.lastActiveBannerId = active?.id ?? null;
    this.scheduleEphemeralExpiry();
  }

  private ensureRotation(): void {
    if (this.rotateTimer !== null) return;

    this.rotateTimer = window.setInterval(() => {
      if (this.paused) return;

      const count = this.banners.length;
      if (count <= 1) return;

      this.activeIndex = (this.activeIndex + 1) % count;
      this.renderIfNeeded(true);
    }, ROTATE_MS);
  }

  private stopRotation(): void {
    if (this.rotateTimer === null) return;
    window.clearInterval(this.rotateTimer);
    this.rotateTimer = null;
  }

  private scheduleEphemeralExpiry(): void {
    const active = this.banners[this.activeIndex];
    if (!active || active.persistence !== 'ephemeral') {
      this.stopEphemeralTimer();
      this.ephemeralExpiryTargetId = null;
      return;
    }

    if (this.ephemeralExpiryTargetId === active.id && this.ephemeralTimer !== null) {
      return;
    }

    this.stopEphemeralTimer();
    this.ephemeralExpiryTargetId = active.id;

    const duration = active.displayMs ?? EPHEMERAL_DEFAULT_MS;
    this.ephemeralTimer = window.setTimeout(() => {
      this.removeEphemeral(active.id);
    }, duration);
  }

  private stopEphemeralTimer(): void {
    if (this.ephemeralTimer === null) return;
    window.clearTimeout(this.ephemeralTimer);
    this.ephemeralTimer = null;
  }
}
