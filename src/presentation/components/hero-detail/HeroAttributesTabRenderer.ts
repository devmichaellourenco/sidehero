import { HeroDto } from '../../../application/dto/GameStateDto';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderAttributeChip(
  key: 'str' | 'dex' | 'int',
  label: string,
  total: number,
  allocated: number,
  canSpend: boolean,
): string {
  const allocatedHint =
    allocated > 0 ? `<span class="hero-attr-allocated">+${allocated}</span>` : '';

  return `
    <div class="hero-attr-chip">
      <span class="hero-attr-label">${label}</span>
      <span class="hero-attr-value">${total}${allocatedHint}</span>
      <button
        type="button"
        class="hero-attr-add"
        data-attr-spend="${key}"
        title="Gastar 1 ponto em ${label}"
        aria-label="Aumentar ${label}"
        ${canSpend ? '' : 'disabled'}
      >+</button>
    </div>
  `;
}

function renderStatRow(line: HeroDto['combatStatSheet'][number]['lines'][number]): string {
  const tooltip = line.tooltipLines
    .map((entry) => `<span class="hero-stat-tooltip-line">${escapeHtml(entry)}</span>`)
    .join('');

  return `
    <div class="hero-stat-row" data-hero-stat-tooltip tabindex="0" aria-label="${escapeHtml(line.label)}: ${escapeHtml(line.value)}">
      <span class="hero-stat-label">${escapeHtml(line.label)}</span>
      <span class="hero-stat-value">${escapeHtml(line.value)}</span>
      <span class="hero-stat-tooltip-content hidden">
        <strong class="hero-stat-tooltip-title">${escapeHtml(line.label)}</strong>
        ${tooltip}
      </span>
    </div>
  `;
}

function renderStatSection(section: HeroDto['combatStatSheet'][number]): string {
  if (section.lines.length === 0) return '';

  return `
    <section class="hero-stat-section" aria-label="${escapeHtml(section.title)}">
      <h3 class="hero-stat-section-title">${escapeHtml(section.title)}</h3>
      <div class="hero-stat-list">
        ${section.lines.map(renderStatRow).join('')}
      </div>
    </section>
  `;
}

export function renderHeroAttributesTab(hero: HeroDto): string {
  const points = hero.unspentImprovementPoints;
  const canSpend = points >= 1;

  return `
    <section class="hero-attributes-tab">
      <p class="hero-detail-hint hero-attributes-points">
        Pontos de aprimoramento: <strong>${points}</strong>
      </p>
      <div class="hero-attr-row">
        ${renderAttributeChip('str', 'STR', hero.totalAttributes.str, hero.allocatedAttributes.str, canSpend)}
        ${renderAttributeChip('dex', 'DEX', hero.totalAttributes.dex, hero.allocatedAttributes.dex, canSpend)}
        ${renderAttributeChip('int', 'INT', hero.totalAttributes.int, hero.allocatedAttributes.int, canSpend)}
      </div>
      <div class="hero-combat-stat-sheet">
        ${hero.combatStatSheet.map(renderStatSection).join('')}
      </div>
    </section>
  `;
}
