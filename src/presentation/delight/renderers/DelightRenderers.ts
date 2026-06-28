import { getGearSprite, getHeroSprite, imgTag } from '../../assets/AssetCatalog';
import { RewardMoment } from '../types/RewardMoment';

export class CelebrationCardRenderer {
  constructor(private readonly root: HTMLElement) {}

  show(moment: RewardMoment): Promise<void> {
    return new Promise((resolve) => {
      const card = document.createElement('article');
      card.className = `delight-card delight-card--${moment.tone}`;
      card.setAttribute('role', 'status');
      card.dataset.delightKind = moment.kind;

      const iconMarkup = this.buildIconMarkup(moment);
      const detailMarkup = this.buildDetailMarkup(moment);
      const ctaMarkup = moment.cta
        ? `<button type="button" class="delight-card-cta" data-delight-cta>${moment.cta.label}</button>`
        : '';

      card.innerHTML = `
        <div class="delight-card-glow" aria-hidden="true"></div>
        <div class="delight-card-inner">
          <div class="delight-card-icon-wrap">${iconMarkup}</div>
          <div class="delight-card-copy">
            <p class="delight-card-eyebrow">${this.eyebrowFor(moment)}</p>
            <h2 class="delight-card-title">${moment.title}</h2>
            ${moment.subtitle ? `<p class="delight-card-subtitle">${moment.subtitle}</p>` : ''}
            ${detailMarkup}
          </div>
          ${ctaMarkup}
        </div>
      `;

      const dismiss = () => {
        card.classList.remove('delight-card--visible');
        window.setTimeout(() => {
          card.remove();
          resolve();
        }, 280);
      };

      card.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.closest('[data-delight-cta]')) return;
        dismiss();
      });

      const ctaBtn = card.querySelector('[data-delight-cta]') as HTMLButtonElement | null;
      if (ctaBtn && moment.cta) {
        ctaBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          moment.cta?.onClick();
          dismiss();
        });
      }

      this.root.appendChild(card);

      requestAnimationFrame(() => {
        card.classList.add('delight-card--visible');
      });

      const duration = moment.autoDismissMs ?? 3200;
      window.setTimeout(() => {
        if (card.isConnected) dismiss();
      }, duration);
    });
  }

  private eyebrowFor(moment: RewardMoment): string {
    switch (moment.kind) {
      case 'chest_available':
        return 'Recompensa';
      case 'level_up':
        return 'Level Up';
      case 'phase_cleared':
        return 'Campanha';
      case 'tier_up':
        return 'Progressão';
      case 'season_complete':
        return 'Conquista';
      case 'feature_unlock':
      case 'upgrade_purchased':
        return 'Desbloqueado';
      case 'loot_received':
      case 'shop_purchase':
        return 'Novo Item';
      case 'forge_created':
        return 'Forja Divina';
      case 'idle_report':
        return 'Relatório';
      default:
        return 'Vitória';
    }
  }

  private buildIconMarkup(moment: RewardMoment): string {
    if (moment.gear) {
      const sprite = getGearSprite(moment.gear);
      const frameClass = `delight-gear-frame delight-gear-frame--${moment.gear.rarity}`;
      return `<div class="${frameClass}">${imgTag(sprite, moment.gear.name, 'delight-card-gear-sprite')}</div>`;
    }

    if (moment.heroPortrait) {
      const sprite = getHeroSprite(moment.heroPortrait);
      return imgTag(sprite, moment.heroPortrait.name, 'delight-card-hero-portrait');
    }

    if (moment.heroEmoji) {
      return `<span class="delight-card-emoji">${moment.heroEmoji}</span>`;
    }

    if (moment.iconUrl) {
      return imgTag(moment.iconUrl, '', 'delight-card-icon');
    }

    return '<span class="delight-card-spark" aria-hidden="true">✦</span>';
  }

  private buildDetailMarkup(moment: RewardMoment): string {
    if (!moment.detailLines?.length) return '';

    const items = moment.detailLines.map((line) => `<li>${line}</li>`).join('');
    return `<ul class="delight-card-details">${items}</ul>`;
  }
}

export class MacroOverlayRenderer {
  constructor(private readonly root: HTMLElement) {}

  show(moment: RewardMoment): Promise<void> {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = `delight-macro delight-macro--${moment.tone}`;
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');

      const iconMarkup = moment.iconUrl
        ? imgTag(moment.iconUrl, '', 'delight-macro-icon')
        : '<span class="delight-macro-trophy" aria-hidden="true">🏆</span>';

      const detailMarkup = moment.detailLines?.length
        ? `<ul class="delight-macro-details">${moment.detailLines.map((line) => `<li>${line}</li>`).join('')}</ul>`
        : '';

      overlay.innerHTML = `
        <div class="delight-macro-backdrop" data-delight-dismiss></div>
        <div class="delight-macro-panel">
          <div class="delight-macro-icon-wrap">${iconMarkup}</div>
          <p class="delight-macro-eyebrow">${moment.kind === 'idle_report' ? 'Enquanto você estava fora' : 'Conquista Épica'}</p>
          <h2 class="delight-macro-title">${moment.title}</h2>
          ${moment.subtitle ? `<p class="delight-macro-subtitle">${moment.subtitle}</p>` : ''}
          ${detailMarkup}
          <button type="button" class="delight-macro-cta" data-delight-dismiss>Continuar</button>
        </div>
      `;

      const dismiss = () => {
        overlay.classList.remove('delight-macro--visible');
        window.setTimeout(() => {
          overlay.remove();
          resolve();
        }, 320);
      };

      overlay.querySelectorAll('[data-delight-dismiss]').forEach((element) => {
        element.addEventListener('click', dismiss);
      });

      this.root.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.classList.add('delight-macro--visible');
      });

      const duration = moment.autoDismissMs ?? 7000;
      window.setTimeout(() => {
        if (overlay.isConnected) dismiss();
      }, duration);
    });
  }
}
