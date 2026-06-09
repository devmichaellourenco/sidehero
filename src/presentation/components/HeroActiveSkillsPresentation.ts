import { HeroDto } from '../../application/dto/GameStateDto';
import { imgTag } from '../assets/AssetCatalog';
import { getSkillBranchFrameUrl, getSkillIconUrl } from '../assets/SkillIconCatalog';
import { getGearFrameSprite } from '../assets/AssetCatalog';
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

  const frameUrl = getSkillBranchFrameUrl(skill.branch);

  return `
    <button
      type="button"
      class="loadout-slot loadout-slot--skill hero-skill-chip hero-skill-chip--${skill.branch}"
      data-hero-skills-open="${heroId}"
      data-skill-tooltip
      aria-label="${escapeHtml(skill.name)} — ${escapeHtml(rankLabel)}"
      title="${escapeHtml(skill.name)}"
      style="--slot-frame: url('${frameUrl}')"
    >
      ${imgTag(getSkillIconUrl(skill.id), skill.name, 'loadout-slot-icon hero-skill-chip-icon')}
      ${renderSkillTooltipContent(skill)}
    </button>
  `;
}

function renderEmptySkillSlot(): string {
  const frameUrl = getGearFrameSprite('common');

  return `<span class="loadout-slot loadout-slot--skill loadout-slot--empty hero-skill-chip hero-skill-chip--empty" style="--slot-frame: url('${frameUrl}')" aria-hidden="true"></span>`;
}

export function renderHeroActiveSkillSlots(hero: HeroDto): string {
  const slots = Array.from({ length: hero.maxActiveSkills }, (_, index) => hero.activeSkills[index] ?? null);

  return slots
    .map((skill) => (skill ? renderSkillChip(skill, hero.id) : renderEmptySkillSlot()))
    .join('');
}
