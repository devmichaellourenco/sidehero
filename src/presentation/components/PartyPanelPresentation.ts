import { HeroDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { renderHeroBars } from './HeroBarsPresentation';
import { renderHeroLoadoutStrip } from './HeroLoadoutStripPresentation';

function renderPartyControls(hero: HeroDto, state: {
  canEditParty: boolean;
  activeParty: HeroDto[];
}): string {
  if (!state.canEditParty) {
    return '';
  }

  const index = state.activeParty.findIndex((entry) => entry.id === hero.id);
  const canRemove = state.activeParty.length > 1;
  const canMoveUp = index > 0;
  const canMoveDown = index >= 0 && index < state.activeParty.length - 1;

  return `
    <div class="party-slot-controls">
      <button type="button" class="party-btn" data-party-move-up="${hero.id}" ${canMoveUp ? '' : 'disabled'} title="Subir ordem">↑</button>
      <button type="button" class="party-btn" data-party-move-down="${hero.id}" ${canMoveDown ? '' : 'disabled'} title="Descer ordem">↓</button>
      ${
        canRemove
          ? `<button type="button" class="party-btn party-btn-remove" data-party-remove="${hero.id}" title="Enviar para reserva">−</button>`
          : ''
      }
    </div>
  `;
}

function renderActiveHeroCard(
  hero: HeroDto,
  state: { canEditParty: boolean; activeParty: HeroDto[] },
): string {
  const attackIcon = getAssetUrl(ASSETS.ui.attack);
  const defenseIcon = getAssetUrl(ASSETS.ui.defense);
  const healthIcon = getAssetUrl(ASSETS.ui.health);

  return `
    <article class="hero-card party-active-card" data-hero-card="${hero.id}">
      ${renderPartyControls(hero, state)}
      <button type="button" class="hero-card-main" data-hero-open="${hero.id}">
        <div class="hero-card-header">
          <strong class="hero-card-title">
            ${imgTag(getHeroSprite(hero.heroClass), hero.name, 'hero-card-icon')}
            <span>${hero.name}</span>
          </strong>
          <div class="hero-card-meta">
            <span class="hero-level">Lv.${hero.level}</span>
            <span class="hero-inline-stats">
              ${imgTag(attackIcon, 'Ataque', 'stat-icon')}
              <span>${hero.attack}</span>
              ${imgTag(defenseIcon, 'Defesa', 'stat-icon')}
              <span>${hero.defense}</span>
              ${imgTag(healthIcon, 'Vida', 'stat-icon')}
              <span>${hero.health}/${hero.maxHealth}</span>
            </span>
          </div>
        </div>
        ${renderHeroBars(hero, { compact: true })}
      </button>
      ${renderHeroLoadoutStrip(hero)}
    </article>
  `;
}

function renderBenchHeroCard(hero: HeroDto, canEditParty: boolean, partyFull: boolean): string {
  return `
    <article class="party-bench-card" data-bench-hero="${hero.id}">
      ${imgTag(getHeroSprite(hero.heroClass), hero.name, 'party-bench-icon')}
      <div class="party-bench-info">
        <strong>${hero.name}</strong>
        <span class="party-bench-meta">Lv.${hero.level} · ${hero.heroClass}</span>
      </div>
      ${
        canEditParty
          ? `<button type="button" class="party-btn party-btn-add" data-party-add="${hero.id}" ${
              partyFull ? 'disabled' : ''
            } title="Adicionar à party">+</button>`
          : ''
      }
    </article>
  `;
}

export function renderPartyPanel(state: {
  activeParty: HeroDto[];
  benchHeroes: HeroDto[];
  canEditParty: boolean;
}): string {
  const partyFull = state.activeParty.length >= 3;
  const lockNotice = state.canEditParty
    ? ''
    : `<p class="party-lock-notice" title="Use o botão ⏸ acima da batalha para pausar e editar party e loadout.">🔒 Party bloqueada durante a fase</p>`;

  const activeHtml =
    state.activeParty.length > 0
      ? state.activeParty
          .map((hero) => renderActiveHeroCard(hero, state))
          .join('')
      : '<p class="empty-state">Nenhum herói na party ativa.</p>';

  const benchHtml =
    state.benchHeroes.length > 0
      ? state.benchHeroes
          .map((hero) => renderBenchHeroCard(hero, state.canEditParty, partyFull))
          .join('')
      : '';

  return `
    <div class="party-panel">
      ${lockNotice}
      <section class="party-active-section">
        <h3 class="party-section-title">Party ativa <span class="party-count">${state.activeParty.length}/3</span></h3>
        <div class="party-active-list">${activeHtml}</div>
      </section>
      ${
        benchHtml
          ? `<section class="party-bench-section">
              <h3 class="party-section-title">Reserva</h3>
              <div class="party-bench-list">${benchHtml}</div>
            </section>`
          : ''
      }
    </div>
  `;
}
