import { ActSceneDto } from '../../application/dto/CampaignDto';
import { getAssetUrl } from '../assets/AssetCatalog';
import { escapeHtml } from './CampaignMapPresentation';

export function resolveActSceneImageUrl(scene: ActSceneDto): string | null {
  return scene.imageAssetPath ? getAssetUrl(scene.imageAssetPath) : null;
}

export function renderActSceneCard(scene: ActSceneDto): string {
  if (!scene.unlocked) {
    return `
      <article class="campaign-act-scene campaign-act-scene--locked" data-campaign-act-scene="${escapeHtml(scene.id)}" aria-hidden="true">
        <div class="campaign-act-scene-locked-copy">
          <span class="campaign-act-scene-eyebrow">Cena do ato</span>
          <p>Desbloqueie este ato para revelar a narrativa.</p>
        </div>
      </article>
    `;
  }

  const imageUrl = resolveActSceneImageUrl(scene);
  const imageMarkup = imageUrl
    ? `<img class="campaign-act-scene-image" src="${escapeHtml(imageUrl)}" alt="" loading="lazy" />`
    : '<div class="campaign-act-scene-image campaign-act-scene-image--placeholder" aria-hidden="true"></div>';

  const viewedBadge = scene.viewed
    ? '<span class="campaign-act-scene-badge">Vista</span>'
    : '<span class="campaign-act-scene-badge campaign-act-scene-badge--new">Nova</span>';

  return `
    <article class="campaign-act-scene" data-campaign-act-scene="${escapeHtml(scene.id)}">
      <div class="campaign-act-scene-media">${imageMarkup}</div>
      <div class="campaign-act-scene-copy">
        <div class="campaign-act-scene-heading">
          <span class="campaign-act-scene-eyebrow">Cena · Ato ${scene.actNumber}</span>
          ${viewedBadge}
        </div>
        <h4 class="campaign-act-scene-title">${escapeHtml(scene.title)}</h4>
        <p class="campaign-act-scene-recap">${escapeHtml(scene.recap)}</p>
        <button type="button" class="campaign-act-scene-read-btn" data-act-scene-read="${escapeHtml(scene.id)}">
          Ver cena
        </button>
      </div>
    </article>
  `;
}

export function renderActSceneOverlay(scene: ActSceneDto): string {
  const imageUrl = resolveActSceneImageUrl(scene);
  const imageMarkup = imageUrl
    ? `<img class="act-scene-overlay-image" src="${escapeHtml(imageUrl)}" alt="" />`
    : '';

  return `
    <div class="act-scene-overlay-card" data-act-scene-overlay="${escapeHtml(scene.id)}">
      <div class="act-scene-overlay-media">${imageMarkup}</div>
      <div class="act-scene-overlay-copy">
        <span class="act-scene-overlay-eyebrow">Ato ${scene.actNumber}</span>
        <h2 class="act-scene-overlay-title">${escapeHtml(scene.title)}</h2>
        <section class="act-scene-overlay-section">
          <h3>O que passou</h3>
          <p>${escapeHtml(scene.recap)}</p>
        </section>
        <section class="act-scene-overlay-section">
          <h3>Pela frente</h3>
          <p>${escapeHtml(scene.preview)}</p>
        </section>
        <button type="button" class="act-scene-overlay-dismiss" data-act-scene-dismiss>
          CONTINUAR
        </button>
      </div>
    </div>
  `;
}
