import { getGearSprite, getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { WowBanner } from './types/WowBanner';

export interface WowStripRenderOptions {
  animate?: boolean;
}

export class WowStripRenderer {
  render(
    root: HTMLElement,
    banners: WowBanner[],
    activeIndex: number,
    options: WowStripRenderOptions = {},
  ): void {
    const banner = banners[activeIndex] ?? banners[0];
    if (!banner) {
      root.innerHTML = '';
      return;
    }

    const enterClass = options.animate ? ' wow-banner--enter' : '';

    const dots =
      banners.length > 1
        ? `<div class="wow-strip-dots" role="tablist" aria-label="Banners">
            ${banners
              .map(
                (_, index) => `
                  <button
                    type="button"
                    class="wow-strip-dot${index === activeIndex ? ' wow-strip-dot--active' : ''}"
                    data-wow-dot="${index}"
                    aria-label="Banner ${index + 1}"
                    aria-selected="${index === activeIndex}"
                  ></button>
                `,
              )
              .join('')}
          </div>`
        : '';

    const progressMarkup =
      typeof banner.progressRatio === 'number'
        ? `<div class="wow-banner-progress" aria-hidden="true"><span style="width: ${Math.round(banner.progressRatio * 100)}%"></span></div>`
        : '';

    const detailsMarkup = banner.detailLines?.length
      ? `<ul class="wow-banner-details">${banner.detailLines.map((line) => `<li>${line}</li>`).join('')}</ul>`
      : '';

    const ctaMarkup = banner.cta
      ? `<button type="button" class="wow-banner-cta" data-wow-action="${banner.cta.action}">${banner.cta.label}</button>`
      : '';

    root.innerHTML = `
      <div class="wow-strip-bg" aria-hidden="true"></div>
      <article class="wow-banner wow-banner--${banner.tone}${enterClass}" data-wow-banner-id="${banner.id}">
        <div class="wow-banner-glow" aria-hidden="true"></div>
        <div class="wow-banner-visual">${this.buildVisualMarkup(banner)}</div>
        <div class="wow-banner-copy">
          ${banner.eyebrow ? `<p class="wow-banner-eyebrow">${banner.eyebrow}</p>` : ''}
          <h3 class="wow-banner-title">${banner.title}</h3>
          ${banner.subtitle ? `<p class="wow-banner-subtitle">${banner.subtitle}</p>` : ''}
          ${detailsMarkup}
          ${progressMarkup}
        </div>
        ${ctaMarkup}
      </article>
      ${dots}
    `;
  }

  private buildVisualMarkup(banner: WowBanner): string {
    if (banner.gear) {
      const sprite = getGearSprite(banner.gear);
      return `<div class="wow-banner-gear-frame wow-banner-gear-frame--${banner.gear.rarity}">${imgTag(sprite, banner.gear.name, 'wow-banner-gear-sprite')}</div>`;
    }

    if (banner.heroPortrait) {
      const sprite = getHeroSprite(banner.heroPortrait);
      return imgTag(sprite, banner.heroPortrait.name, 'wow-banner-hero-portrait');
    }

    if (banner.heroEmoji) {
      return `<span class="wow-banner-emoji">${banner.heroEmoji}</span>`;
    }

    if (banner.iconUrl) {
      return imgTag(banner.iconUrl, '', 'wow-banner-icon');
    }

    return '<span class="wow-banner-spark" aria-hidden="true">✦</span>';
  }
}
