import { HeroDto } from '../../../application/dto/GameStateDto';

export function renderHeroAttributesTab(hero: HeroDto): string {
  const points = hero.unspentImprovementPoints;

  return `
    <section class="hero-attributes-tab">
      <p class="hero-detail-hint">
        Pontos de aprimoramento: <strong>${points}</strong>
      </p>
      <div class="hero-attr-grid">
        <div class="hero-attr-card">
          <span class="hero-attr-label">STR</span>
          <span class="hero-attr-total">${hero.totalAttributes.str}</span>
          <span class="hero-attr-base">(+${hero.allocatedAttributes.str} alocado)</span>
          <button type="button" class="hero-attr-btn" data-attr-spend="str" ${points < 1 ? 'disabled' : ''}>+1 STR</button>
        </div>
        <div class="hero-attr-card">
          <span class="hero-attr-label">DEX</span>
          <span class="hero-attr-total">${hero.totalAttributes.dex}</span>
          <span class="hero-attr-base">(+${hero.allocatedAttributes.dex} alocado)</span>
          <button type="button" class="hero-attr-btn" data-attr-spend="dex" ${points < 1 ? 'disabled' : ''}>+1 DEX</button>
        </div>
        <div class="hero-attr-card">
          <span class="hero-attr-label">INT</span>
          <span class="hero-attr-total">${hero.totalAttributes.int}</span>
          <span class="hero-attr-base">(+${hero.allocatedAttributes.int} alocado)</span>
          <button type="button" class="hero-attr-btn" data-attr-spend="int" ${points < 1 ? 'disabled' : ''}>+1 INT</button>
        </div>
      </div>
    </section>
  `;
}
