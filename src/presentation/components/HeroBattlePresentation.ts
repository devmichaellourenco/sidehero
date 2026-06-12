import { HeroDto } from '../../application/dto/GameStateDto';
import {
  formatExperienceLabel,
  formatHealthLabel,
  renderHeroStripHealthBar,
} from './HeroBarsPresentation';
import { renderCombatSkillIntent } from './CombatSkillIntentPresentation';
import { renderCombatStatusEffects } from './CombatStatusEffectPresentation';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderHeroTooltipContent(hero: HeroDto): string {
  const healthLabel = formatHealthLabel(hero);
  const xpLabel = formatExperienceLabel(hero);

  return `
    <strong class="hero-tooltip-name">${escapeHtml(hero.name)}</strong>
    <span class="hero-tooltip-line">Lv.${hero.level}</span>
    <span class="hero-tooltip-line">${healthLabel}</span>
    <span class="hero-tooltip-line">${xpLabel}</span>
    <span class="hero-tooltip-line">ATK ${hero.attack} · DEF ${hero.defense}</span>
    <span class="hero-tooltip-line">ASPD ${hero.attackSpeed.toFixed(2)}/s · Cast ${hero.castSpeed.toFixed(2)}×</span>
    <span class="hero-tooltip-line">Crít ${(hero.critChance * 100).toFixed(1)}% · Dmg ${(hero.critDamage * 100).toFixed(0)}%</span>
  `;
}

export function renderHeroBattleSprite(
  hero: HeroDto,
  glowHtml: string,
  spriteHtml: string,
  options: { isActiveTurn?: boolean } = {},
): string {
  const activeClass = options.isActiveTurn ? ' hero-battle-card--active-turn' : '';

  return `
    <div class="hero-battle-card${activeClass}" data-hero-id="${escapeHtml(hero.id)}">
      <button
        type="button"
        class="hero-sprite hero-sprite--interactive"
        data-float-anchor="hero"
        data-hero-tooltip
        data-hero-battle-open="${escapeHtml(hero.id)}"
        aria-label="Abrir ${escapeHtml(hero.name)}"
      >
        ${glowHtml}
        ${spriteHtml}
        <span class="hero-tooltip-content hidden">${renderHeroTooltipContent(hero)}</span>
      </button>
      ${renderCombatStatusEffects(hero.statusEffects)}
      ${renderHeroStripHealthBar(hero)}
      ${renderCombatSkillIntent(options.isActiveTurn ? hero.combatIntent : null)}
    </div>
  `;
}
