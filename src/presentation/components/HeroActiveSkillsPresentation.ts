import { HeroDto } from '../../application/dto/GameStateDto';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderHeroActiveSkills(hero: HeroDto): string {
  const slots = Array.from({ length: hero.maxActiveSkills }, (_, index) => hero.activeSkills[index] ?? null);

  return `
    <div class="hero-active-skills" aria-label="Skills ativas na batalha (${hero.activeSkills.length}/${hero.maxActiveSkills})">
      ${slots
        .map((skill) =>
          skill
            ? `<span class="hero-skill-chip hero-skill-chip--${skill.branch}" title="${escapeHtml(skill.name)}">${escapeHtml(skill.name)}</span>`
            : '<span class="hero-skill-chip hero-skill-chip--empty" aria-hidden="true">—</span>',
        )
        .join('')}
    </div>
  `;
}
