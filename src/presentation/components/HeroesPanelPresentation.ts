import { HeroDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { navArrowIconHtml } from '../assets/NavArrowPresentation';
import { renderHeroFormationTooltipContent } from './HeroBattlePresentation';
import { renderHeroBars } from './HeroBarsPresentation';
import { renderHeroLoadoutStrip } from './HeroLoadoutStripPresentation';
import { bindHeroTooltips } from './HeroTooltipBinder';

export type HeroesPanelTab = 'battling' | 'formation';

type PartyPanelState = {
  activeParty: HeroDto[];
  benchHeroes: HeroDto[];
  canEditParty: boolean;
};

function clampBattlingIndex(partySize: number, index: number): number {
  if (partySize <= 0) return 0;
  return Math.max(0, Math.min(partySize - 1, index));
}

function renderBattlingHeroFocus(hero: HeroDto, index: number, partySize: number): string {
  const attackIcon = getAssetUrl(ASSETS.ui.attack);
  const defenseIcon = getAssetUrl(ASSETS.ui.defense);
  const healthIcon = getAssetUrl(ASSETS.ui.health);
  const glowUrl = getAssetUrl(ASSETS.characters.glow);
  const hasPrev = index > 0;
  const hasNext = index < partySize - 1;

  return `
    <div class="battling-hero-focus">
      <div class="battling-hero-toolbar">
        <button
          type="button"
          class="battling-hero-nav"
          data-battling-hero-prev
          aria-label="Herói anterior"
          ${hasPrev ? '' : 'disabled'}
        >${navArrowIconHtml('prev')}</button>
        <span class="battling-hero-position" aria-live="polite">
          ${hero.name} · ${index + 1}/${partySize}
        </span>
        <button
          type="button"
          class="battling-hero-nav"
          data-battling-hero-next
          aria-label="Próximo herói"
          ${hasNext ? '' : 'disabled'}
        >${navArrowIconHtml('next')}</button>
      </div>

      <article class="battling-hero-card party-active-card" data-hero-card="${hero.id}">
        <button type="button" class="battling-hero-main" data-hero-open="${hero.id}">
          <div class="battling-hero-portrait" aria-hidden="true">
            <img class="battling-hero-glow" src="${glowUrl}" alt="" />
            ${imgTag(getHeroSprite(hero), hero.name, 'battling-hero-sprite')}
          </div>
          <div class="battling-hero-info">
            <div class="battling-hero-title">
              <strong>${hero.name}</strong>
              <span class="hero-level">Lv.${hero.level}</span>
            </div>
            <div class="hero-stats battling-hero-stats">
              ${imgTag(attackIcon, 'Ataque', 'stat-icon')}
              <span>${hero.attack}</span>
              ${imgTag(defenseIcon, 'Defesa', 'stat-icon')}
              <span>${hero.defense}</span>
              ${imgTag(healthIcon, 'Vida', 'stat-icon')}
              <span>${hero.health}/${hero.maxHealth}</span>
            </div>
            ${renderHeroBars(hero)}
          </div>
        </button>
        ${renderHeroLoadoutStrip(hero, { variant: 'featured' })}
      </article>
    </div>
  `;
}

function renderFormationSprite(hero: HeroDto): string {
  return `
    <div class="formation-slot-sprite" data-hero-tooltip tabindex="0">
      ${imgTag(getHeroSprite(hero), hero.name, 'formation-hero-image')}
      <span class="hero-tooltip-content hidden">${renderHeroFormationTooltipContent(hero)}</span>
    </div>
  `;
}

function renderFormationRemoveButton(
  hero: HeroDto,
  state: Pick<PartyPanelState, 'canEditParty' | 'activeParty'>,
): string {
  if (!state.canEditParty || state.activeParty.length <= 1) {
    return '<div class="formation-slot-toolbar formation-slot-toolbar--spacer" aria-hidden="true"></div>';
  }

  return `
    <div class="formation-slot-toolbar">
      <button
        type="button"
        class="party-btn party-btn-remove formation-remove-btn"
        data-party-remove="${hero.id}"
        title="Enviar para reserva"
        aria-label="Remover ${hero.name} da equipe"
      >−</button>
    </div>
  `;
}

function renderFormationSwapButton(
  leftIndex: number,
  canEditParty: boolean,
): string {
  if (!canEditParty) return '';

  return `
    <button
      type="button"
      class="party-btn formation-swap-btn"
      data-party-swap="${leftIndex}"
      title="Trocar ordem"
      aria-label="Trocar ordem dos heróis"
    >⇄</button>
  `;
}

function renderFormationActiveSlot(
  hero: HeroDto,
  state: Pick<PartyPanelState, 'canEditParty' | 'activeParty'>,
): string {
  return `
    <article class="formation-slot" data-formation-hero="${hero.id}">
      ${renderFormationRemoveButton(hero, state)}
      ${renderFormationSprite(hero)}
    </article>
  `;
}

function renderFormationActiveRow(state: PartyPanelState): string {
  if (state.activeParty.length === 0) {
    return '<p class="empty-state formation-empty">Nenhum herói na equipe.</p>';
  }

  const parts: string[] = [];

  state.activeParty.forEach((hero, index) => {
    parts.push(renderFormationActiveSlot(hero, state));

    if (index < state.activeParty.length - 1) {
      parts.push(`
        <div class="formation-swap-cell">
          ${renderFormationSwapButton(index, state.canEditParty)}
        </div>
      `);
    }
  });

  return parts.join('');
}

function renderFormationBenchSlot(
  hero: HeroDto,
  canEditParty: boolean,
  partyFull: boolean,
): string {
  return `
    <article class="formation-bench-slot" data-bench-hero="${hero.id}">
      <div class="formation-bench-sprite" data-hero-tooltip tabindex="0">
        ${imgTag(getHeroSprite(hero), hero.name, 'formation-hero-image')}
        <span class="hero-tooltip-content hidden">${renderHeroFormationTooltipContent(hero)}</span>
      </div>
      ${
        canEditParty
          ? `<button type="button" class="party-btn party-btn-add formation-bench-add" data-party-add="${hero.id}" ${
              partyFull ? 'disabled' : ''
            } title="Adicionar à equipe">+</button>`
          : ''
      }
    </article>
  `;
}

function renderPartyLockNotice(canEditParty: boolean): string {
  if (canEditParty) return '';

  return `<p class="party-lock-notice" title="Use o botão ⏸ acima da batalha para pausar e editar party e loadout.">🔒 Formação bloqueada durante a fase</p>`;
}

function renderBattlingTab(state: PartyPanelState, battlingHeroIndex: number): string {
  if (state.activeParty.length === 0) {
    return `
      <div class="heroes-tab-panel heroes-tab-panel--battling">
        <p class="empty-state">Nenhum herói em batalha.</p>
      </div>
    `;
  }

  const safeIndex = clampBattlingIndex(state.activeParty.length, battlingHeroIndex);
  const hero = state.activeParty[safeIndex];

  return `
    <div class="heroes-tab-panel heroes-tab-panel--battling">
      ${renderBattlingHeroFocus(hero, safeIndex, state.activeParty.length)}
    </div>
  `;
}

function renderFormationTab(state: PartyPanelState): string {
  const partyFull = state.activeParty.length >= 3;

  const activeHtml = renderFormationActiveRow(state);

  const benchHtml =
    state.benchHeroes.length > 0
      ? state.benchHeroes
          .map((hero) => renderFormationBenchSlot(hero, state.canEditParty, partyFull))
          .join('')
      : '<p class="empty-state formation-empty">Reserva vazia.</p>';

  return `
    <div class="heroes-tab-panel heroes-tab-panel--formation">
      ${renderPartyLockNotice(state.canEditParty)}
      <section class="formation-section">
        <h3 class="party-section-title">Equipe <span class="party-count">${state.activeParty.length}/3</span></h3>
        <div class="formation-active-row">${activeHtml}</div>
      </section>
      <section class="formation-section formation-bench-section">
        <h3 class="party-section-title">Reserva</h3>
        <div class="formation-bench-row">${benchHtml}</div>
      </section>
    </div>
  `;
}

export function renderHeroesPanel(
  state: PartyPanelState,
  tab: HeroesPanelTab,
  battlingHeroIndex = 0,
): string {
  return `
    <nav class="heroes-panel-tabs" aria-label="Abas de heróis">
      <button type="button" class="heroes-panel-tab ${tab === 'battling' ? 'active' : ''}" data-heroes-tab="battling">Batalhando</button>
      <button type="button" class="heroes-panel-tab ${tab === 'formation' ? 'active' : ''}" data-heroes-tab="formation">Formação</button>
    </nav>
    ${tab === 'formation' ? renderFormationTab(state) : renderBattlingTab(state, battlingHeroIndex)}
  `;
}

export function bindHeroesPanelInteractions(container: HTMLElement): void {
  bindHeroTooltips(container);
}

export { clampBattlingIndex };
