import { HeroDto } from '../../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, imgTag } from '../../assets/AssetCatalog';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderImprovementTooltipContent(): string {
  return `
    <strong class="hero-improvement-tooltip-title">Aprimoramento</strong>
    <span class="hero-improvement-tooltip-line">Você ganha <strong>1 Aprimoramento</strong> a cada nível.</span>
    <span class="hero-improvement-tooltip-line hero-improvement-tooltip-section">Como usar</span>
    <span class="hero-improvement-tooltip-line">· <strong>Status</strong> — toque em <strong>+</strong> em STR, DEX ou INT.</span>
    <span class="hero-improvement-tooltip-line">· <strong>Skills</strong> — suba o rank de skills desbloqueadas.</span>
    <span class="hero-improvement-tooltip-line hero-improvement-tooltip-note">O mesmo saldo vale para atributos e skills.</span>
  `;
}

export function renderHeroImprovementPoints(hero: HeroDto): string {
  const points = hero.unspentImprovementPoints;
  const availableClass = points > 0 ? ' hero-improvement-points--available' : '';
  const icon = imgTag(getAssetUrl(ASSETS.ui.improvement), 'Aprimoramento', 'hero-improvement-points-icon');

  return `
    <div
      class="hero-improvement-points${availableClass}"
      data-hero-improvement-tooltip
      tabindex="0"
      aria-label="Aprimoramento: ${points}"
    >
      ${icon}
      <span class="hero-improvement-points-copy">
        <span class="hero-improvement-points-label">Aprimoramento</span>
        <span class="hero-improvement-points-value">${points}</span>
      </span>
      <span class="hero-improvement-tooltip-content hidden">${renderImprovementTooltipContent()}</span>
    </div>
  `;
}

export function improvementSpendLabel(attributeLabel: string): string {
  return `Gastar 1 Aprimoramento em ${escapeHtml(attributeLabel)}`;
}
