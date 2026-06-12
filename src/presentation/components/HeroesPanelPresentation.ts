import { HeroDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../assets/AssetCatalog';
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

function renderBattlingHeroCard(hero: HeroDto): string {
  const attackIcon = getAssetUrl(ASSETS.ui.attack);
  const defenseIcon = getAssetUrl(ASSETS.ui.defense);
  const healthIcon = getAssetUrl(ASSETS.ui.health);

  return `
    <article class="hero-card party-active-card" data-hero-card="${hero.id}">
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

function renderFormationSprite(hero: HeroDto): string {
  return `
    <div class="formation-slot-sprite" data-hero-tooltip tabindex="0">
      ${imgTag(getHeroSprite(hero.heroClass), hero.name, 'formation-hero-image')}
      <span class="hero-tooltip-content hidden">${renderHeroFormationTooltipContent(hero)}</span>
    </div>
  `;
}

function renderFormationControls(
  hero: HeroDto,
  state: Pick<PartyPanelState, 'canEditParty' | 'activeParty'>,
): string {
  if (!state.canEditParty) return '';

  const index = state.activeParty.findIndex((entry) => entry.id === hero.id);
  const canRemove = state.activeParty.length > 1;
  const canMoveLeft = index > 0;
  const canMoveRight = index >= 0 && index < state.activeParty.length - 1;

  return `
    <div class="formation-slot-controls">
      <button type="button" class="party-btn" data-party-move-up="${hero.id}" ${canMoveLeft ? '' : 'disabled'} title="Mover para esquerda">←</button>
      <button type="button" class="party-btn" data-party-move-down="${hero.id}" ${canMoveRight ? '' : 'disabled'} title="Mover para direita">→</button>
      ${
        canRemove
          ? `<button type="button" class="party-btn party-btn-remove" data-party-remove="${hero.id}" title="Enviar para reserva">−</button>`
          : ''
      }
    </div>
  `;
}

function renderFormationActiveSlot(
  hero: HeroDto,
  state: Pick<PartyPanelState, 'canEditParty' | 'activeParty'>,
): string {
  return `
    <article class="formation-slot" data-formation-hero="${hero.id}">
      ${renderFormationSprite(hero)}
      ${renderFormationControls(hero, state)}
    </article>
  `;
}

function renderFormationBenchSlot(
  hero: HeroDto,
  canEditParty: boolean,
  partyFull: boolean,
): string {
  return `
    <article class="formation-bench-slot" data-bench-hero="${hero.id}">
      <div class="formation-bench-sprite" data-hero-tooltip tabindex="0">
        ${imgTag(getHeroSprite(hero.heroClass), hero.name, 'formation-hero-image')}
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

function renderBattlingTab(state: PartyPanelState): string {
  const activeHtml =
    state.activeParty.length > 0
      ? state.activeParty.map((hero) => renderBattlingHeroCard(hero)).join('')
      : '<p class="empty-state">Nenhum herói em batalha.</p>';

  return `
    <div class="heroes-tab-panel heroes-tab-panel--battling">
      <div class="party-active-list">${activeHtml}</div>
    </div>
  `;
}

function renderFormationTab(state: PartyPanelState): string {
  const partyFull = state.activeParty.length >= 3;

  const activeHtml =
    state.activeParty.length > 0
      ? state.activeParty.map((hero) => renderFormationActiveSlot(hero, state)).join('')
      : '<p class="empty-state formation-empty">Nenhum herói na equipe.</p>';

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

export function renderHeroesPanel(state: PartyPanelState, tab: HeroesPanelTab): string {
  return `
    <nav class="heroes-panel-tabs" aria-label="Abas de heróis">
      <button type="button" class="heroes-panel-tab ${tab === 'battling' ? 'active' : ''}" data-heroes-tab="battling">Batalhando</button>
      <button type="button" class="heroes-panel-tab ${tab === 'formation' ? 'active' : ''}" data-heroes-tab="formation">Formação</button>
    </nav>
    ${tab === 'formation' ? renderFormationTab(state) : renderBattlingTab(state)}
  `;
}

export function bindHeroesPanelInteractions(container: HTMLElement): void {
  bindHeroTooltips(container);
}
