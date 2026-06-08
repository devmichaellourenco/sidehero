import { HeroDto } from '../../application/dto/GameStateDto';
import { renderSkillRankLabel, renderSkillTooltipContent } from './SkillTooltipPresentation';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSkillChip(skill: HeroDto['activeSkills'][number], heroId: string): string {
  const rankLabel = renderSkillRankLabel(skill.currentRank, skill.maxRank);

  return `
    <button
      type="button"
      class="hero-skill-chip hero-skill-chip--${skill.branch}"
      data-hero-skills-open="${heroId}"
      data-skill-tooltip
      aria-label="${escapeHtml(skill.name)} — ${escapeHtml(rankLabel)}"
    >
      <span class="hero-skill-chip-label">${escapeHtml(skill.name)}</span>
      ${renderSkillTooltipContent(skill)}
    </button>
  `;
}

export function renderHeroActiveSkills(hero: HeroDto): string {
  const slots = Array.from({ length: hero.maxActiveSkills }, (_, index) => hero.activeSkills[index] ?? null);

  return `
    <div class="hero-active-skills" aria-label="Skills ativas na batalha (${hero.activeSkills.length}/${hero.maxActiveSkills})">
      ${slots
        .map((skill) =>
          skill
            ? renderSkillChip(skill, hero.id)
            : '<span class="hero-skill-chip hero-skill-chip--empty" aria-hidden="true">—</span>',
        )
        .join('')}
    </div>
  `;
}
